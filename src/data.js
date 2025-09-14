// src/data.js
// Product catalog: subscriptions (only one allowed in cart) and accessories
const list = [
  {
    id: 1,
    service: "Basic Subscription",
    serviceInfo: "For one User",
    price: 4.99,
    img: "https://creazilla-store.fra1.digitaloceanspaces.com/icons/3231802/ticket-icon-md.png",
    amount: 1,
  },
  {
    id: 2,
    service: "Gold Subscription",
    serviceInfo: "Share with Family",
    price: 9.99,
    img: "https://creazilla-store.fra1.digitaloceanspaces.com/icons/3237088/ticket-icon-md.png",
    amount: 1,
  },
  {
    id: 3,
    service: "Premium Subscription",
    serviceInfo: "Share with the World",
    price: 12.99,
    img: "https://creazilla-store.fra1.digitaloceanspaces.com/icons/3258730/ticket-icon-md.png",
    amount: 1,
  },
  {
    id: 4,
    service: "Social Media Sharing Subscription",
    serviceInfo: "Share your list",
    price: 2.99,
    img: "/icons/share.svg",   // ✅ updated to your local share icon
    amount: 1,
  },
  {
    id: 5,
    service: "EZ Tech T-Shirt",
    serviceInfo: "Show your List to the World!!!",
    price: 25.99,
    img: "https://cdn.creazilla.com/cliparts/5548105/tie-dye-t-shirt-clipart-md.png",
    amount: 2000,
  },
  {
    id: 6,
    service: "EZ Techplosion",
    serviceInfo: "Share your List to all!!!",
    price: 25.99,
    img: "https://cdn.creazilla.com/cliparts/7487471/tie-dye-t-shirt-clipart-md.png",
    amount: 1400,
  },
  {
    id: 7,
    service: "EZ Techmerizing",
    serviceInfo: "Techmerize your friends",
    price: 25.99,
    img: "https://cdn.creazilla.com/cliparts/5632313/tie-dye-t-shirt-clipart-sm.png",
    amount: 1090,
  },
  {
    id: 8,
    service: "EZ Tech Case",
    serviceInfo: "Mesmerize your friends",
    price: 20.99,
    img: "https://cdn.creazilla.com/9ef436f9e9e4cf2733c43b7e61d327d2.jpeg",
    amount: 10090,
  },
];

export default list;
