import { JsonHandler } from '../../../../src/infrastructure/database/json-handler';
import { NextResponse } from 'next/server';

interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sent_at: string;
}

const emailDb = new JsonHandler<SimulatedEmail>('simulated_emails.json');

export async function POST(request: Request) {
  try {
    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const newEmail: SimulatedEmail = {
      id: crypto.randomUUID(),
      to,
      subject,
      body,
      sent_at: new Date().toISOString()
    };

    const emails = await emailDb.readAll();
    emails.unshift(newEmail); // Newest first
    await emailDb.writeAll(emails.slice(0, 50)); // Keep last 50

    return NextResponse.json({ success: true, message: 'Email simulated' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Simulation failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function GET() {
  try {
    const emails = await emailDb.readAll();
    return NextResponse.json({ success: true, data: emails }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await emailDb.writeAll([]);
    return NextResponse.json({ success: true, message: 'History cleared' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to clear' }, { status: 500 });
  }
}

