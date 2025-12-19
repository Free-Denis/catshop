// src/routes/api/blob/save/+server.js
export async function POST({ request }) {
  try {
    const { data } = await request.json();
    const BLOB_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
    const BLOB_URL = "https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com/data.json";
    
    console.log('API: Сохраняем данные в Blob...');
    
    // Пробуем несколько методов
    let response;
    
    // Метод 1: PUT
    response = await fetch(BLOB_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${BLOB_TOKEN}`,
        'Content-Type': 'application/json',
        'x-vercel-blob-access': 'public'
      },
      body: JSON.stringify(data, null, 2)
    });
    
    // Метод 2: Если PUT не работает, пробуем POST
    if (!response.ok) {
      console.log('PUT failed, trying POST...');
      response = await fetch(BLOB_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BLOB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data, null, 2)
      });
    }
    
    console.log('API: Статус сохранения:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Ошибка сохранения:', errorText);
      
      // Возвращаем ошибку с деталями для отладки
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to save to blob: ${response.status}`,
          details: errorText,
          attemptedMethods: ['PUT', 'POST']
        }),
        { status: 500 }
      );
    }
    
    const result = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        url: result.url || BLOB_URL 
      }),
      { status: 200 }
    );
    
  } catch (error) {
    console.error('API: Critical error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500 }
    );
  }
}
