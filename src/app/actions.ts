'use server';

import fs from 'fs/promises';
import path from 'path';

type AnswerPayload = {
  questionId: number;
  question: string;
  answer: string;
};

const dataDir = path.join(process.cwd(), 'src', 'data');
const answersFilePath = path.join(dataDir, 'answers.json');

async function ensureDataDirExists() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Fails silently if the directory already exists.
    // If another error occurs, fs.writeFile will handle it.
  }
}

export async function saveOpenEndedAnswer(data: AnswerPayload) {
  await ensureDataDirExists();

  try {
    let allAnswers: (AnswerPayload & { timestamp: string })[] = [];
    try {
      const fileContent = await fs.readFile(answersFilePath, 'utf-8');
      allAnswers = JSON.parse(fileContent);
    } catch (e: any) {
      // If file doesn't exist (ENOENT) or is empty, we start with an empty array.
      // This is expected on the first run.
      if (e.code !== 'ENOENT') {
        console.error("Error reading answers file, but proceeding:", e);
      }
    }

    allAnswers.push({ ...data, timestamp: new Date().toISOString() });

    await fs.writeFile(answersFilePath, JSON.stringify(allAnswers, null, 2), 'utf-8');
    
    return { success: true };
  } catch (error) {
    console.error('Error saving answer:', error);
    return { success: false, error: 'Failed to save answer.' };
  }
}
