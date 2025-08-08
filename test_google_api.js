// Test Google Translate API key
import { promises as fs } from 'fs';

async function testGoogleAPI() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log('Testing Google Translate API...');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key preview:', apiKey ? `${apiKey.slice(0, 10)}...` : 'No key');
    
    if (!apiKey) {
      console.error('❌ No API key found');
      return;
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'Hello world',
        target: 'tet',
        source: 'en',
        format: 'text'
      })
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API working! Test translation:', data.data.translations[0].translatedText);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

testGoogleAPI();