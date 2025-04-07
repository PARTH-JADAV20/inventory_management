const customersData = [
    {
        id: 1,
        name: "Ramesh Kumar",
        phoneNumber: "9876543210",
        advanceGiven: 1000,
        advanceUsed: 250,
        balance: 750,
        paymentMethod: "Cash",
        advance: true, 
        bills: [
            {
                billNo: "B001",
                date: "01 March 2025",
                items: [
                    { product: "Cement OPC 53 Grade", qty: 5, pricePerQty: 350, amount: 1750 },
                    { product: "River Sand", qty: 10, pricePerQty: 12, amount: 120 },
                ],
                totalAmount: 1870,
                advanceRemaining: 750,
            },
            {
                billNo: "B004",
                date: "05 March 2025",
                items: [
                    { product: "Crushed Stone Aggregate", qty: 8, pricePerQty: 18, amount: 144 },
                ],
                totalAmount: 144,
                advanceRemaining: 606,
            },
        ],
    },
    {
        id: 2,
        name: "Priya Sharma",
        phoneNumber: "8765432109",
        advanceGiven: 2500,
        advanceUsed: 2200,
        balance: 300,
        paymentMethod: "Online",
        advance: true, 
        bills: [
            {
                billNo: "B002",
                date: "02 March 2025",
                items: [
                    { product: "Crushed Stone Aggregate", qty: 15, pricePerQty: 18, amount: 270 },
                ],
                totalAmount: 270,
                advanceRemaining: 300,
            },
        ],
    },
    {
        id: 3,
        name: "Ajay Patel",
        phoneNumber: "7654321098",
        advanceGiven: 5000,
        advanceUsed: 1500,
        balance: 3500,
        paymentMethod: "Card",
        advance: true, 
        bills: [
            {
                billNo: "B003",
                date: "03 March 2025",
                items: [
                    { product: "Steel Reinforcement Bars", qty: 2, pricePerQty: 75, amount: 150 },
                ],
                totalAmount: 150,
                advanceRemaining: 3500,
            },
            {
                billNo: "B005",
                date: "06 March 2025",
                items: [
                    { product: "Cement OPC 53 Grade", qty: 3, pricePerQty: 350, amount: 1050 },
                    { product: "River Sand", qty: 20, pricePerQty: 12, amount: 240 },
                ],
                totalAmount: 1290,
                advanceRemaining: 2210,
            },
        ],
    },
    // Non-advance customers
    {
        id: 4,
        name: "Suresh Mehta",
        phoneNumber: "6543210987",
        paymentMethod: "Cash",
        advance: false,
        bills: [
            {
                billNo: "B006",
                date: "04 March 2025",
                items: [
                    { product: "Cement OPC 53 Grade", qty: 2, pricePerQty: 350, amount: 700 },
                ],
                totalAmount: 700,
            },
        ],
    },
    {
        id: 5,
        name: "Neha Gupta",
        phoneNumber: "5432109876",
        paymentMethod: "Online",
        advance: false,
        bills: [
            {
                billNo: "B007",
                date: "05 March 2025",
                items: [
                    { product: "River Sand", qty: 15, pricePerQty: 12, amount: 180 },
                    { product: "Crushed Stone Aggregate", qty: 10, pricePerQty: 18, amount: 180 },
                ],
                totalAmount: 360,
            },
        ],
    },
    {
        id: 6,
        name: "Vikram Singh",
        phoneNumber: "4321098765",
        paymentMethod: "Card",
        advance: false,
        bills: [
            {
                billNo: "B003",
                date: "03 March 2025",
                items: [
                    { product: "Steel Reinforcement Bars", qty: 2, pricePerQty: 75, amount: 150 },
                ],
                totalAmount: 150,
                advanceRemaining: 3500,
            },
            {
                billNo: "B005",
                date: "04 March 2025",
                items: [
                    { product: "Cement OPC 53 Grade", qty: 3, pricePerQty: 350, amount: 1050 },
                    { product: "River Sand", qty: 20, pricePerQty: 12, amount: 240 },
                ],
                totalAmount: 1290,
                advanceRemaining: 2210,
            },
        ],
    },
];

export default customersData;