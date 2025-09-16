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
    img: "/share.svg",   // point to public/share.svg
    amount: 1,
  },
  {
    id: 5,
    service: "EZ Tech T-Shirt",
    serviceInfo: "Show your List to the World!!!",
    price: 25.99,
    img: "/icons/tshirt1.svg",
    amount: 2000,
  },
  {
    id: 6,
    service: "EZ Techplosion",
    serviceInfo: "Share your List to all!!!",
    price: 25.99,
    img: "/icons/tshirt2.svg",
    amount: 1400,
  },
  {
    id: 7,
    service: "EZ Techmerizing",
    serviceInfo: "Techmerize your friends",
    price: 25.99,
    img: "/icons/tshirt3.svg",
    amount: 1090,
  },
  {
    id: 8,
    service: "EZ Tech Case",
    serviceInfo: "Mesmerize your friends",
    price: 20.99,
    img: "/icons/case.svg",
    amount: 10090,
  },
];

export default list;
