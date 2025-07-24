import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '../../../lib/mongodb';

export async function GET(req) {
  const shop = req.nextUrl.searchParams.get('shop');
  
  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
  }

  try {
    const settings = await getSettings(shop);
    
    if (settings) {
      return NextResponse.json({
        success: true,
        settings: {
          topValue: settings.topValue,
          xAxis: settings.xAxis,
          yAxis: settings.yAxis,
          xAxisCollections: settings.xAxisCollections || [],
          yAxisCollections: settings.yAxisCollections || [],
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        settings: null
      });
    }
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { shop, topValue, xAxis, yAxis, xAxisCollections, yAxisCollections } = await req.json();
    
    if (!shop) {
      return NextResponse.json({ error: 'Shop is required' }, { status: 400 });
    }

    const settingsData = {
      topValue: topValue || '',
      xAxis: xAxis || '',
      yAxis: yAxis || '',
      xAxisCollections: xAxisCollections || [],
      yAxisCollections: yAxisCollections || []
    };

    const result = await saveSettings(shop, settingsData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
} 