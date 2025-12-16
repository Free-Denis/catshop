// src/lib/db/schema.js
export const usersSchema = {
  users: [
    {
      id: "string",        // Уникальный ID пользователя
      username: "string",  // Логин
      password: "string",  // Хэшированный пароль
      email: "string",     // Email (опционально)
      createdAt: "string", // Дата создания
      cart: [             // Корзина пользователя
        {
          id: "string",    // Уникальный ID котика
          name: "string",  // Имя котика
          breed: "string", // Порода
          eyes: "string",  // Цвет глаз
          fur: "string",   // Тип шерсти
          thickness: "number", // Толщина шерсти (1-5)
          price: "number", // Цена
          status: "string", // "cart" | "ordered" | "sold"
          createdAt: "string"
        }
      ],
      orders: [           // Заказы пользователя
        {
          id: "string",
          items: [
            {
              catId: "string",
              name: "string",
              breed: "string",
              price: "number"
            }
          ],
          total: "number",
          status: "string", // "pending" | "completed" | "cancelled"
          createdAt: "string"
        }
      ]
    }
  ]
};