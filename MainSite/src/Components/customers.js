const customersData = [
    {
        phoneNumber: "9876543210",
        profiles: [
            {
                profileId: "a9x7q2",
                name: "Ramesh Kumar [A]",
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
                        billNo: "B002",
                        date: "02 March 2025",
                        items: [{ product: "Bricks", qty: 100, pricePerQty: 6, amount: 600 }],
                        totalAmount: 600,
                        advanceRemaining: 650,
                    },
                    {
                        billNo: "B003",
                        date: "03 March 2025",
                        items: [{ product: "TMT Bars", qty: 2, pricePerQty: 500, amount: 1000 }],
                        totalAmount: 1000,
                        advanceRemaining: 500,
                    },
                ],
            },
            {
                profileId: "b5p1lm",
                name: "Ramesh Kumar [B]",
                advanceGiven: 2000,
                advanceUsed: 1800,
                balance: 200,
                paymentMethod: "Online",
                advance: true,
                bills: [
                    {
                        billNo: "B004",
                        date: "05 March 2025",
                        items: [{ product: "Crushed Stone Aggregate", qty: 8, pricePerQty: 18, amount: 144 }],
                        totalAmount: 144,
                        advanceRemaining: 200,
                    },
                    {
                        billNo: "B010",
                        date: "06 March 2025",
                        items: [{ product: "Fly Ash", qty: 50, pricePerQty: 4, amount: 200 }],
                        totalAmount: 200,
                        advanceRemaining: 100,
                    },
                    {
                        billNo: "B011",
                        date: "07 March 2025",
                        items: [{ product: "Paver Blocks", qty: 30, pricePerQty: 20, amount: 600 }],
                        totalAmount: 600,
                        advanceRemaining: 50,
                    },
                ],
            },
        ],
    },
    {
        phoneNumber: "8765432109",
        profiles: [
            {
                profileId: "x2v8zp",
                name: "Priya Sharma [A]",
                advanceGiven: 2500,
                advanceUsed: 2200,
                balance: 300,
                paymentMethod: "Online",
                advance: true,
                bills: [
                    {
                        billNo: "B005",
                        date: "02 March 2025",
                        items: [{ product: "Crushed Stone Aggregate", qty: 15, pricePerQty: 18, amount: 270 }],
                        totalAmount: 270,
                        advanceRemaining: 300,
                    },
                    {
                        billNo: "B012",
                        date: "03 March 2025",
                        items: [{ product: "Cement OPC 53 Grade", qty: 4, pricePerQty: 350, amount: 1400 }],
                        totalAmount: 1400,
                        advanceRemaining: 200,
                    },
                    {
                        billNo: "B013",
                        date: "04 March 2025",
                        items: [{ product: "M-Sand", qty: 8, pricePerQty: 25, amount: 200 }],
                        totalAmount: 200,
                        advanceRemaining: 100,
                    },
                ],
            },
            {
                profileId: "g5np1x",
                name: "Priya Sharma [B]",
                advanceGiven: 1500,
                advanceUsed: 1000,
                balance: 500,
                paymentMethod: "Cash",
                advance: true,
                bills: [
                    {
                        billNo: "B021",
                        date: "08 March 2025",
                        items: [{ product: "Bricks", qty: 150, pricePerQty: 6, amount: 900 }],
                        totalAmount: 900,
                        advanceRemaining: 600,
                    },
                    {
                        billNo: "B022",
                        date: "09 March 2025",
                        items: [{ product: "Red Soil", qty: 20, pricePerQty: 10, amount: 200 }],
                        totalAmount: 200,
                        advanceRemaining: 500,
                    },
                ],
            },
        ],
    },
    {
        phoneNumber: "7654321098",
        profiles: [
            {
                profileId: "kq93ab",
                name: "Ajay Patel [A]",
                advanceGiven: 5000,
                advanceUsed: 1500,
                balance: 3500,
                paymentMethod: "Card",
                advance: true,
                bills: [
                    {
                        billNo: "B006",
                        date: "03 March 2025",
                        items: [{ product: "Steel Reinforcement Bars", qty: 2, pricePerQty: 75, amount: 150 }],
                        totalAmount: 150,
                        advanceRemaining: 3500,
                    },
                    {
                        billNo: "B014",
                        date: "05 March 2025",
                        items: [{ product: "Concrete Mix", qty: 3, pricePerQty: 500, amount: 1500 }],
                        totalAmount: 1500,
                        advanceRemaining: 2000,
                    },
                    {
                        billNo: "B015",
                        date: "06 March 2025",
                        items: [{ product: "Red Soil", qty: 10, pricePerQty: 20, amount: 200 }],
                        totalAmount: 200,
                        advanceRemaining: 1800,
                    },
                ],
            },
            {
                profileId: "zt82lp",
                name: "Ajay Patel [B]",
                advanceGiven: 3000,
                advanceUsed: 1200,
                balance: 1800,
                paymentMethod: "Online",
                advance: true,
                bills: [
                    {
                        billNo: "B016",
                        date: "07 March 2025",
                        items: [{ product: "Fly Ash", qty: 70, pricePerQty: 5, amount: 350 }],
                        totalAmount: 350,
                        advanceRemaining: 2650,
                    },
                    {
                        billNo: "B017",
                        date: "08 March 2025",
                        items: [{ product: "M-Sand", qty: 15, pricePerQty: 25, amount: 375 }],
                        totalAmount: 375,
                        advanceRemaining: 2275,
                    },
                ],
            },
        ],
    },
    {
        phoneNumber: "6543210987",
        profiles: [
            {
                profileId: "d7n2wz",
                name: "Suresh Mehta",
                advance: false,
                paymentMethod: "Cash",
                bills: [
                    {
                        billNo: "B007",
                        date: "04 March 2025",
                        items: [{ product: "Cement OPC 53 Grade", qty: 2, pricePerQty: 350, amount: 700 }],
                        totalAmount: 700,
                    },
                ],
            },
        ],
    },
    {
        phoneNumber: "5432109876",
        profiles: [
            {
                profileId: "q8p1zr",
                name: "Neha Gupta",
                advance: false,
                paymentMethod: "Online",
                bills: [
                    {
                        billNo: "B008",
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
                profileId: "w4xm23",
                name: "Neha Gupta [B]",
                advance: false,
                paymentMethod: "Card",
                bills: [
                    {
                        billNo: "B009",
                        date: "06 March 2025",
                        items: [
                            { product: "Steel Reinforcement Bars", qty: 2, pricePerQty: 75, amount: 150 },
                            { product: "Cement OPC 53 Grade", qty: 3, pricePerQty: 350, amount: 1050 },
                        ],
                        totalAmount: 1200,
                    },
                ],
            },
        ],
    },
];

export default customersData;
