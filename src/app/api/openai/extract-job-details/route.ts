import { OpenAI } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: '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',
});

export async function POST(req: Request) {
  try {
    const { jobDescription } = await req.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert job analyzer. Extract the following information from the job description:
1. Job Title (exact title from the posting)
2. Company Name (if mentioned)

Return ONLY a JSON object with these two fields, nothing else. Example:
{
  "jobTitle": "Senior Software Engineer",
  "company": "Google"
}

If either piece of information is not found, use "Unknown" as the value.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openai.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: jobDescription,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const jobDetails = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(jobDetails);
  } catch (error) {
    console.error('Error in extract-job-details API route:', error);
    return NextResponse.json(
      { error: 'Failed to extract job details', details: (error as Error).message },
      { status: 500 }
    );
  }
} 