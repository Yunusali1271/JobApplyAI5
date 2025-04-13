// Simple test script for the analyze-cv API endpoint
import fetch from 'node-fetch';

async function testAnalyzeCvApi() {
  try {
    // Sample data - in a real application, these would be actual CV and job description content
    const testData = {
      cv: "John Doe\nEmail: john.doe@example.com\nPhone: 123-456-7890\n\nSummary\nExperienced software developer with 5 years of experience in web development.\n\nEducation\nBachelor of Science in Computer Science, University of Example, 2018\nGPA: 3.8\n\nExperience\nSenior Developer, Tech Company Inc., 2020-Present\n- Led a team of 5 developers on project X\n- Increased performance by 40%\n\nJunior Developer, Startup LLC, 2018-2020\n- Developed responsive web applications\n- Worked with React and Node.js",
      jobDescription: "Software Engineer position at Amazing Tech Co.\nResponsibilities include developing web applications using React, managing a small team, and optimizing application performance.\nRequirements: Bachelor's degree in CS or related field, 3+ years experience in web development, leadership skills.",
      formality: "neutral"
    };

    // Send the request to the API endpoint
    console.log('Sending request to analyze-cv API...');
    const response = await fetch('http://localhost:3000/api/openai/analyze-cv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    
    // Show a summary of the results
    console.log('\n=== API Response Summary ===');
    console.log('Resume length:', data.resume?.length || 'Not provided');
    console.log('Cover letter length:', data.result?.length || 'Not provided');
    console.log('Follow-up email length:', data.followUpEmail?.length || 'Not provided');
    
    // Show a sample of each (first 200 chars)
    if (data.resume) {
      console.log('\n=== Resume Sample ===');
      console.log(data.resume.substring(0, 200) + '...');
    }
    
    if (data.result) {
      console.log('\n=== Cover Letter Sample ===');
      console.log(data.result.substring(0, 200) + '...');
    }
    
    if (data.followUpEmail) {
      console.log('\n=== Follow-up Email Sample ===');
      console.log(data.followUpEmail.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testAnalyzeCvApi(); 