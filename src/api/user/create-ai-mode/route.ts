
'use server';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json({ error: 'This feature has been removed.' }, { status: 410 });
}
