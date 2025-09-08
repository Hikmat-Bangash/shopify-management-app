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
    const body = await req.json();
    console.log('Settings API received:', body);
    
    const { shop, topValue, xAxis, yAxis, xAxisCollections, yAxisCollections } = body;
    
    if (!shop) {
      console.log('No shop provided');
      return NextResponse.json({ error: 'Shop is required' }, { status: 400 });
    }

    const settingsData = {
      topValue: topValue || '',
      xAxis: xAxis || '',
      yAxis: yAxis || '',
      xAxisCollections: xAxisCollections || [],
      yAxisCollections: yAxisCollections || []
    };

    console.log('Settings data to save:', settingsData);

    const result = await saveSettings(shop, settingsData);
    
    console.log('Save settings result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings: ' + error.message }, { status: 500 });
  }
} 