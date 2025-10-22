
import { GoogleGenAI, Type } from "@google/genai";
import type { RepoData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Schema for the deepest level of files/folders (no children)
const treeNodeSchemaLevel3 = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['folder', 'file'] },
        path: { type: Type.STRING },
    },
    required: ['id', 'name', 'type', 'path'],
};

// Schema for the middle level of folders (can contain nodes without children)
const treeNodeSchemaLevel2 = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['folder', 'file'] },
        path: { type: Type.STRING },
        children: {
            type: Type.ARRAY,
            items: treeNodeSchemaLevel3
        }
    },
    required: ['id', 'name', 'type', 'path'],
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        languages: {
            type: Type.ARRAY,
            description: "An array of objects, where each object represents a language and its usage percentage.",
            items: {
                type: Type.OBJECT,
                properties: {
                    language: { type: Type.STRING, description: "The programming language name." },
                    percentage: { type: Type.NUMBER, description: "The usage percentage." }
                },
                required: ['language', 'percentage']
            }
        },
        dependencies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['frontend', 'backend', 'dev', 'general'] }
                },
                required: ['name', 'type']
            }
        },
        tree: {
            type: Type.ARRAY,
            description: "A tree structure of files and folders. Each item has id, name, type ('folder' or 'file'), path, and optional children array for folders.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['folder', 'file'] },
                    path: { type: Type.STRING },
                    children: {
                        type: Type.ARRAY,
                        items: treeNodeSchemaLevel2
                    }
                },
                required: ['id', 'name', 'type', 'path']
            }
        }
    },
    required: ['name', 'description', 'languages', 'dependencies', 'tree']
};

export async function parseRepo(repoUrl: string): Promise<RepoData> {
    const prompt = `
        Analyze the public GitHub repository at this URL: ${repoUrl}.
        Based on its contents (package.json, requirements.txt, pyproject.toml, Dockerfile, file extensions, etc.), provide a structured JSON representation.

        Your response MUST conform to the provided JSON schema.
        The file 'tree' should be a hierarchical structure representing folders and files.
        Each node in the tree must have a unique 'id', 'name', 'type' ('folder' or 'file'), and its full 'path'.
        For dependencies, categorize them as 'frontend', 'backend', 'dev', or 'general'.
        If the repository is simple, provide a plausible, representative structure.
        For example, a simple React app would have 'src', 'public' folders, and dependencies like 'react', 'react-dom'.
        Do not include more than 3 levels of nesting for folders to keep the visualization clean.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });

        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);
        
        // Basic validation
        if (!parsedData.name || !Array.isArray(parsedData.tree)) {
            throw new Error("Invalid data structure received from AI.");
        }

        return parsedData as RepoData;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to analyze the repository. The AI model might be unavailable or the repository URL is invalid.");
    }
}
