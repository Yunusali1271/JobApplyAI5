import { OpenAI } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

// Initialize the OpenAI client with the provided API key
const openai = new OpenAI({
  apiKey: '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',
});

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { cv, jobDescription, formality } = await req.json();

    console.log('Received request with:');
    console.log('CV length:', cv?.length || 0);
    console.log('Job Description length:', jobDescription?.length || 0);
    console.log('Formality:', formality);

    // Validate the input
    if (!cv || !jobDescription) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'CV and job description are required' },
        { status: 400 }
      );
    }

    // Map formality level to the expected format in the prompt
    let formalityLevel = '';
    switch (formality) {
      case 'informal':
        formalityLevel = 'Informal';
        break;
      case 'semi-casual':
        formalityLevel = 'Casual';
        break;
      case 'neutral':
        formalityLevel = 'Standard';
        break;
      case 'semi-formal':
        formalityLevel = 'Formal';
        break;
      case 'formal':
        formalityLevel = 'Professional';
        break;
      default:
        formalityLevel = 'Standard';
    }

    // Create the system prompt for CV/resume generation
    console.log('Calling OpenAI API for CV/resume...');
    
    const cvResumeSystemPrompt = `CV and Job Description Analysis System
SYSTEM CONTEXT
You are an expert CV/resume analyzer and career coach specializing in creating tailored Harvard-style CVs and personalized cover letters. Your task is to analyze the content from PDF-extracted resume data and job descriptions to create optimized application materials that maximize the candidate's chances of success.
INPUT DATA
You will receive three inputs:
1.	The extracted text content from the candidate's CV/resume PDF
2.	The full job description text
3.	The desired formality level for the cover letter (informal, casual, standard, formal, professional)
PRIMARY OBJECTIVES
1. ANALYZE THE CV/RESUME
•	Identify all key components: contact information, personal statement, education, work experience, skills, publications, awards
•	Extract relevant keywords, achievements, and quantifiable metrics
•	Identify potential gaps or weaknesses in the original CV
•	Determine the candidate's core strengths and unique value proposition
2. ANALYZE THE JOB DESCRIPTION
•	Extract essential requirements, responsibilities, and qualifications
•	Identify primary and secondary keywords
•	Determine industry-specific terminology and desired soft skills
•	Recognize the company's values and culture from the language used
3. CREATE A TAILORED HARVARD-STYLE CV
Structure the CV in the following format:
1.	Contact Information 
o	Full name, phone number, email, LinkedIn URL (omit physical address)
o	No photographs unless specifically requested
2.	Personal Statement/Profile 
o	2-3 concise sentences that align the candidate's experience with the job requirements
o	Highlight most relevant qualifications and unique value proposition
o	Include specific language that mirrors the job posting
3.	Education 
o	Reverse chronological order
o	Institution names, locations, graduation dates
o	Degree titles, concentrations, minors
o	GPA if above 3.5/4.0
o	Relevant coursework that aligns with job requirements
o	Academic honors and distinctions
4.	Work/Research Experience 
o	Reverse chronological order
o	Company/organization names, locations, employment dates
o	Job titles with clear descriptions
o	3-5 bullet points per position using ACTION VERBS
o	Quantify achievements wherever possible (%, $, time saved)
o	Focus on experiences most relevant to the target position
o	Emphasize transferable skills for career changers
5.	Skills Section 
o	Technical skills relevant to the position
o	Language proficiencies with competency levels
o	Software and tools expertise
o	Soft skills that match job requirements
6.	Publications/Presentations (if applicable) 
o	Use appropriate citation format (APA, MLA)
o	List only the most relevant/impressive publications
7.	Awards and Affiliations 
o	Scholarships, honors, and recognitions
o	Professional memberships and leadership roles
4. CREATE A TARGETED COVER LETTER
•	Adapt tone and language based on the specified formality level: 
o	Informal: Conversational, personal stories, first-person heavy
o	Casual: Friendly but professional, some personal elements
o	Standard: Balanced professional tone, moderate formality
o	Formal: Traditional business language, minimal personal elements
o	Professional: Highest level of formality, sophisticated vocabulary, industry-specific terminology
•	Structure the cover letter with: 
1.	Professional header with contact information
2.	Date and company address
3.	Personalized greeting
4.	Opening paragraph that hooks the reader and states the position
5.	1-2 body paragraphs highlighting specific qualifications matched to job requirements
6.	Closing paragraph with call to action
7.	Professional sign-off
FORMATTING GUIDELINES
For Harvard-Style CV:
•	Use clean, professional font (Arial or Times New Roman, 11-12pt)
•	Maintain consistent formatting throughout
•	Use bullet points for experience and achievements
•	Limited bold/italics for emphasis only
•	1-inch margins on all sides
•	1-2 pages maximum (unless candidate is senior academic/executive)
•	Consistent date format throughout
•	Section headers clearly distinguished
•	No graphics, charts, or colors
For Cover Letter:
•	Match formality level to specified requirement
•	3-4 paragraphs maximum
•	250-400 words total
•	One page only
•	Professional closing (Sincerely, Regards, etc.)
OUTPUT FORMAT
Provide a complete Harvard-style CV tailored to the job description.
ADDITIONAL GUIDANCE
•	Delete irrelevant experiences or skills not applicable to the target position
•	Reorganize sections to emphasize strengths that match job requirements
•	Use industry-specific terminology from the job description
•	Incorporate keywords naturally throughout both documents for ATS optimization
•	Focus on achievements rather than responsibilities
•	Every bullet point should demonstrate value, not just describe tasks
•	Use present tense for current positions, past tense for previous roles
•	Eliminate first-person pronouns from the CV (but allow in cover letter)
•	Provide brief explanations for gaps in employment history if evident
•	Prioritize recent, relevant experience over older roles
  Do not provide any other additional text at the bottom of the cv i just want the cv/resume content no need to for an explanation at the bottom of the resume;`
  

    const cvResumeUserPrompt = `
Please analyze the following CV and job description to create a tailored Harvard-style resume with a ${formalityLevel} formality level:

CV:
${cv}

Job Description:
${jobDescription}

Formality Level: ${formalityLevel}

Please create a Harvard-style CV that is optimized for this specific job description, highlighting the most relevant qualifications from the original CV.
`;

    // Call the OpenAI API for CV/resume
    const cvResumeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: cvResumeSystemPrompt,
          },
          {
            role: 'user',
            content: cvResumeUserPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!cvResumeResponse.ok) {
      const errorData = await cvResumeResponse.json();
      console.error('OpenAI API error (CV/resume):', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const cvResumeData = await cvResumeResponse.json();
    
    if (!cvResumeData.choices || !cvResumeData.choices[0] || !cvResumeData.choices[0].message) {
      console.error('Invalid response format from OpenAI (CV/resume):', cvResumeData);
      throw new Error('Invalid response format from OpenAI for CV/resume');
    }
    
    const cvResumeContent = cvResumeData.choices[0].message.content;
    console.log('CV/resume content length:', cvResumeContent?.length || 0);
    
    console.log('Calling OpenAI API for cover letter...');
    
    // Create the system prompt for cover letter generation with updated instructions
    const coverLetterSystemPrompt = `# CV/Resume and Job Description Analysis for Tailored Cover Letter Generation

## CONTEXT
You are an expert career advisor tasked with generating personalized cover letters by analyzing both the candidate's resume/CV and the specific job description they're applying for. Your goal is to create a highly tailored cover letter that highlights the most relevant qualifications, experiences, and skills from the candidate's resume that match the requirements in the job description.

## INPUT STRUCTURE
You will receive three inputs:
1. The content of the candidate's resume/CV (scanned from PDF)
2. The job description they are applying to
3. The desired formality level of the cover letter (Informal, Casual, Standard, Formal, or Professional)

## ANALYSIS PROCESS
For each cover letter request, follow these steps:

1. RESUME ANALYSIS:
   - Identify the candidate's name, contact information, and professional title
   - Extract key qualifications (education and degree), skills, and competencies
   - Note significant achievements and quantifiable results
   - Identify education, certifications, and specialized training
   - Catalog relevant work experience, focusing on responsibilities and accomplishments
   - Identify unique selling points that differentiate this candidate

2. JOB DESCRIPTION ANALYSIS:
   - Identify the hiring company and role
   - Extract explicit requirements (must-haves, essential qualifications)
   - Note desired qualifications (nice-to-have skills and experiences)
   - Determine key responsibilities of the role
   - Identify company values, culture elements, or mission statements
   - Note industry-specific terminology or keywords

3. MATCHING ANALYSIS:
   - Create a correlation between the candidate's experiences/skills and job requirements
   - Identify the strongest alignment points between resume and job description
   - Note any potential gaps and how transferable skills might address them
   - Select 3-5 specific examples from the resume that directly relate to job requirements
   - IMPORTANT: If minimal alignment exists between the resume and job description, focus on:
      a) Identifying any transferable skills, even if from different contexts/industries
      b) Finding character traits or work approaches that could apply across domains
      c) Highlighting educational background or foundational skills that could serve as a basis for growth
      d) Identifying learning experiences or adaptability examples that demonstrate potential

## COVER LETTER GENERATION
Based on your analysis, create a personalized cover letter that:

1. Uses the appropriate formality level as specified:
   - Informal: Conversational, personal tone, first-name basis, contractions
   - Casual: Friendly but professional, contractions, some industry jargon
   - Standard: Balanced professionalism, moderate formality, contractions acceptable
   - Formal: Traditional business tone, full sentences, limited contractions
   - Professional: Highly formal, sophisticated vocabulary, no contractions, complete titles

2. Follows this structure:
   - Opening paragraph: Introduction, position applying for, brief statement of interest and fit
   - Body paragraphs (2-3): Specific examples connecting qualifications to job requirements
   - Closing paragraph: Call to action, availability for interview, gratitude

3. Incorporates:
   - Specificity: References to the company name, role, and key requirements
   - Relevance: Focus only on most relevant qualifications from resume
   - Authenticity: Maintains candidate's voice while enhancing presentation
   - Customization: Demonstrates understanding of both the role and company
   - Brevity: Keeps content concise (300-400 words)

4. Addresses potential gaps by highlighting transferable skills or learning capacity

5. Uses industry-appropriate terminology found in both the resume and job description

## HANDLING SIGNIFICANT MISMATCHES
When the resume and job description have minimal overlap or are entirely different:

1. Prioritize the job description requirements when structuring the cover letter
2. Focus on the candidate's adaptability, learning potential, and transferable soft skills
3. Emphasize any adjacent skills or knowledge that could serve as a foundation
4. Highlight the candidate's genuine interest in transitioning to this new field/role
5. Connect any experiences, even if from different contexts, to the job's core needs
6. Be honest but positive about the transition, framing it as an opportunity for growth
7. Emphasize the candidate's capacity to learn quickly and adapt to new environments
8. Include any relevant coursework, self-study, volunteer work, or personal projects that might not be formal work experience but demonstrate capability or interest in the field

## OUTPUT FORMAT
1. Return a complete, ready-to-use cover letter with appropriate greeting and signature
2. Format the letter with proper paragraphing and spacing

## SPECIAL CONSIDERATIONS
- If the resume lacks certain required qualifications, focus on transferable skills and learning potential
- If the resume contains irrelevant experience, omit it entirely
- Adapt tone and terminology to match the industry context
- For technical roles, emphasize specific technical skills and experiences
- For creative roles, demonstrate understanding of creative processes and portfolio highlights
- For management roles, focus on leadership examples and team achievements`;

    // Create the user prompt for cover letter
    const coverLetterUserPrompt = `
Please analyze the following CV and job description to create a tailored cover letter with a ${formalityLevel} formality level:

CV:
${cv}

Job Description:
${jobDescription}

Formality Level: ${formalityLevel}

Please create a personalized cover letter that highlights the most relevant qualifications from the CV that match the job requirements. The cover letter should use a ${formalityLevel} tone.
`;

    // Call the OpenAI API for cover letter
    const coverLetterResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: coverLetterSystemPrompt,
          },
          {
            role: 'user',
            content: coverLetterUserPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!coverLetterResponse.ok) {
      const errorData = await coverLetterResponse.json();
      console.error('OpenAI API error (cover letter):', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const coverLetterData = await coverLetterResponse.json();
    
    if (!coverLetterData.choices || !coverLetterData.choices[0] || !coverLetterData.choices[0].message) {
      console.error('Invalid response format from OpenAI (cover letter):', coverLetterData);
      throw new Error('Invalid response format from OpenAI for cover letter');
    }
    
    const coverLetterContent = coverLetterData.choices[0].message.content;
    console.log('Cover letter content length:', coverLetterContent?.length || 0);

    // Now call OpenAI API for follow-up email with updated instructions
    console.log('Calling OpenAI API for follow-up email...');
    
    // Create the system prompt for follow-up email
    const followUpEmailSystemPrompt = `# Brief Follow-Up Email Generation Instructions
## CONTEXT
Generate a brief, light-hearted follow-up email for a job application. The email should express continued interest and enthusiasm while gently reminding the hiring manager about the candidate's application.

## INPUT
1. The candidate's resume/CV content (extracted from PDF)
2. The job description they applied to
3. The desired formality level (Informal, Casual, Standard, Formal, or Professional)

## EMAIL REQUIREMENTS
- Create a single paragraph email (3-5 sentences maximum)
- Express genuine enthusiasm for the position and company
- Include a subtle reminder about the application
- Maintain the specified formality level
- Use the specific job title and company name
- Keep the tone positive and light-hearted
- Include an appropriate subject line and signature
- Avoid detailed qualification listings or requesting application status

## OUTPUT
A complete, ready-to-use follow-up email with subject line and brief signature that assumes the application was submitted approximately one week ago.`;

    // Create the user prompt for follow-up email
    const followUpEmailUserPrompt = `
Please analyze the following CV and job description to create a tailored follow-up email with a ${formalityLevel} formality level:

CV:
${cv}

Job Description:
${jobDescription}

Formality Level: ${formalityLevel}

Please create a personalized follow-up email that reinforces the candidate's key qualifications that match the job requirements and demonstrates continued interest in the position. The follow-up email should use a ${formalityLevel} tone.
`;

    // Call the OpenAI API for follow-up email
    const followUpEmailResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: followUpEmailSystemPrompt,
          },
          {
            role: 'user',
            content: followUpEmailUserPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!followUpEmailResponse.ok) {
      const errorData = await followUpEmailResponse.json();
      console.error('OpenAI API error (follow-up email):', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const followUpEmailData = await followUpEmailResponse.json();
    
    if (!followUpEmailData.choices || !followUpEmailData.choices[0] || !followUpEmailData.choices[0].message) {
      console.error('Invalid response format from OpenAI (follow-up email):', followUpEmailData);
      throw new Error('Invalid response format from OpenAI for follow-up email');
    }
    
    const followUpEmailContent = followUpEmailData.choices[0].message.content;
    console.log('Follow-up email content length:', followUpEmailContent?.length || 0);

    // Return all three generated documents
    return NextResponse.json({
      result: coverLetterContent,
      followUpEmail: followUpEmailContent,
      resume: cvResumeContent
    });
  } catch (error) {
    console.error('Error in OpenAI API route:', error);
    return NextResponse.json(
      { error: 'Failed to process with OpenAI', details: (error as Error).message },
      { status: 500 }
    );
  }
} 