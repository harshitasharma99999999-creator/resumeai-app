import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(request: Request) {
  try {
    const { type, resume, jobDescription, experience } = await request.json();

    let result = '';

    if (type === 'ats') {
      if (!resume || !jobDescription) {
        return NextResponse.json({ error: 'Resume and job description are required' }, { status: 400 });
      }
      result = await callGroq(
        `You are an expert ATS resume optimizer. Your job is to rewrite resumes to pass Applicant Tracking Systems (ATS) while maintaining authenticity. 
        Focus on: incorporating keywords from the job description naturally, using standard section headings, quantifying achievements, removing graphics/tables that confuse ATS, and ensuring proper formatting.
        Return ONLY the rewritten resume text, no explanations.`,
        `Job Description:\n${jobDescription}\n\nOriginal Resume:\n${resume}\n\nPlease rewrite this resume to be optimized for ATS scanners based on the job description above.`
      );
    } else if (type === 'linkedin') {
      if (!experience) {
        return NextResponse.json({ error: 'Experience is required' }, { status: 400 });
      }
      result = await callGroq(
        `You are an expert LinkedIn profile writer. Create compelling, professional LinkedIn About sections that attract recruiters and hiring managers.
        The summary should: tell a compelling story, highlight key achievements, include relevant keywords, end with a call to action, and be 200-300 words.
        Return ONLY the LinkedIn summary text, no explanations.`,
        `Please write a compelling LinkedIn About section based on this experience:\n\n${experience}`
      );
    } else if (type === 'cover_letter') {
      if (!resume || !jobDescription) {
        return NextResponse.json({ error: 'Resume and job description are required' }, { status: 400 });
      }
      result = await callGroq(
        `You are an expert cover letter writer. Create personalized, compelling cover letters that make candidates stand out.
        The cover letter should: be addressed professionally, open with a strong hook, highlight 2-3 relevant achievements, show enthusiasm for the role, and end with a clear call to action.
        Return ONLY the cover letter text, no explanations.`,
        `Job Description:\n${jobDescription}\n\nResume:\n${resume}\n\nPlease write a personalized cover letter for this job application.`
      );
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Optimize error:', error);
    return NextResponse.json({ error: 'Failed to generate content. Please try again.' }, { status: 500 });
  }
}
