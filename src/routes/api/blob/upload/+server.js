// src/routes/api/blob/upload/+server.js
export async function POST({ request }) {
  try {
    const { filename, data } = await request.json();
    const BLOB_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
    
    // ЕДИНСТВЕННЫЙ РАБОЧИЙ URL для Vercel Blob API
    const BLOB_API_URL = 'https://api.vercel.com/v2/now/files';
    
    console.log('Отправляем данные в Vercel Blob...');
    
    const response = await fetch(BLOB_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLOB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: [{
          file: filename,
          data: data,
          encoding: 'utf-8'
        }]
      })
    });
    
    console.log('Статус ответа Blob API:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка Blob API:', errorText);
      
      // Пробуем альтернативный метод
      return await tryAlternativeMethod(filename, data, BLOB_TOKEN);
    }
    
    const result = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        url: `https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com/${filename}` 
      }),
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Critical error in blob upload:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500 }
    );
  }
}

// Альтернативный метод
async function tryAlternativeMethod(filename, data, token) {
  console.log('Пробуем альтернативный метод...');
  
  // Альтернативный URL
  const response = await fetch('https://blob.vercel.app/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: filename,
      content: data,
      contentType: 'application/json',
      access: 'public'
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Alternative method failed: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  return new Response(
    JSON.stringify({ 
      success: true, 
      url: result.url 
    }),
    { status: 200 }
  );
}
