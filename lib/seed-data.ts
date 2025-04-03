import { query } from './db'

async function seedData() {
  try {
    // Insert categories
    const categoryNames = [
      'Nigiri & Sashimi',
      'Rolls',
      'Special Rolls',
      'Appetizers',
      'Drinks'
    ]

    for (const name of categoryNames) {
      await query(
        'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [name]
      )
    }

    // Get inserted categories
    const categories = await query('SELECT * FROM categories')
    console.log('Categories inserted:', categories)

    // Sample menu items
    const menuItems = [
      {
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber',
        price: 8.99,
        category: 'Rolls',
        image_url: '/images/california-roll.jpg'
      },
      {
        name: 'Salmon Nigiri',
        description: 'Fresh salmon over rice',
        price: 6.99,
        category: 'Nigiri & Sashimi',
        image_url: '/images/salmon-nigiri.jpg'
      },
      {
        name: 'Spicy Tuna Roll',
        description: 'Spicy tuna with cucumber',
        price: 9.99,
        category: 'Rolls',
        image_url: '/images/spicy-tuna.jpg'
      },
      {
        name: 'Miso Soup',
        description: 'Traditional Japanese soup',
        price: 3.99,
        category: 'Appetizers',
        image_url: '/images/miso-soup.jpg'
      }
    ]

    // Insert menu items
    for (const item of menuItems) {
      const category = categories.find(c => c.name === item.category)
      if (category) {
        await query(
          `INSERT INTO menu_items 
           (name, description, price, category_id, image_url) 
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (name) DO NOTHING`,
          [item.name, item.description, item.price, category.id, item.image_url]
        )
      }
    }

    const insertedItems = await query('SELECT * FROM menu_items')
    console.log('Menu items inserted:', insertedItems)

    console.log('Sample data inserted successfully')
  } catch (error) {
    console.error('Error seeding data:', error)
    throw error
  }
}

seedData() 