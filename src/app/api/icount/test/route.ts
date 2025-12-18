import { NextResponse } from 'next/server';
import { icountLogin, icountGetPayPageList, icountCreatePayPage } from '@/lib/icount';

export async function GET() {
  try {
    // Test 1: Login
    console.log('Testing iCount login...');
    const sid = await icountLogin();
    console.log('Login successful, sid:', sid);

    // Test 2: Get PayPage list
    console.log('Getting PayPage list...');
    const paypages = await icountGetPayPageList();
    console.log('PayPages:', JSON.stringify(paypages, null, 2));

    return NextResponse.json({
      success: true,
      tests: {
        login: { success: true, sid },
        paypages: paypages,
      },
    });
  } catch (error) {
    console.error('iCount test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Create a new PayPage for FutureKids
export async function POST() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    console.log('Creating FutureKids PayPage...');
    const result = await icountCreatePayPage({
      pageName: 'FutureKids - ספרי ילדים',
      doctype: 'invrec', // חשבונית מס קבלה
      successUrl: `${appUrl}/payment/success`,
      ipnUrl: `${appUrl}/api/payment/ipn`,
    });

    console.log('Create PayPage result:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: result.status,
      result,
    });
  } catch (error) {
    console.error('Create PayPage error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
