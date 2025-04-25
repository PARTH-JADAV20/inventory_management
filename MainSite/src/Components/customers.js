const customersData = [
    {
        phoneNumber: "9876543210",
        profiles: [
            {
                profileId: "a9x7q2",
                name: "Ramesh Kumar [A]",
                deleteuser: { value: false, date: "" },
                advance: { value: true, currentamount: 10000, showinadvance: true, paymentMethod: "Cash" },
                advanceHistory: [
                    {
                        transactionType: "Deposit",
                        amount: 1000,
                        date: "2025-03-01",
                    },
                    {
                        transactionType: "Refund",
                        amount: 250,
                        date: "2025-03-01",
                    },
                ],
                bills: [
                    {
                        billNo: "B001",
                        date: "2025-03-01",
                        items: [
                            { product: "Cement OPC 53 Grade", qty: 5, unit: "bags", pricePerQty: 350, amount: 1750 },
                            { product: "River Sand", qty: 10, unit: "kg", pricePerQty: 12, amount: 120 },
                        ],
                        totalAmount: 1870,
                        advanceRemaining: 750,
                        paymentMethod: "Cash",
                    },
                    {
                        billNo: "B002",
                        date: "2025-03-02",
                        items: [{ product: "Bricks", qty: 100, unit: "pieces", pricePerQty: 6, amount: 600 }],
                        totalAmount: 600,
                        advanceRemaining: 650,
                        paymentMethod: "Online",
                    },
                    {
                        billNo: "B003",
                        date: "2025-03-03",
                        items: [{ product: "TMT Bars", qty: 2, unit: "kg", pricePerQty: 500, amount: 1000 }],
                        totalAmount: 1000,
                        advanceRemaining: 500,
                        paymentMethod: "Cheque",
                    },
                ],
            },
            {
                profileId: "b5p1lm",
                name: "Ramesh Kumar [B]",
                advance: { value: true, currentamount: 20000, showinadvance: true, paymentMethod: "Cash" },
                deleteuser: { value: false, date: "" },
                advanceHistory: [
                    {
                        transactionType: "Deposit",
                        amount: 2000,
                        date: "2025-03-05",
                    },
                    {
                        transactionType: "Refund",
                        amount: 1800,
                        date: "2025-03-05",
                    },
                ],
                bills: [
                    {
                        billNo: "B004",
                        date: "2025-03-05",
                        items: [{ product: "Crushed Stone Aggregate", qty: 8, unit: "kg", pricePerQty: 18, amount: 144 }],
                        totalAmount: 144,
                        advanceRemaining: 200,
                        paymentMethod: "Cash",
                    },
                    {
                        billNo: "B010",
                        date: "2025-03-06",
                        items: [{ product: "Fly Ash", qty: 50, unit: "kg", pricePerQty: 4, amount: 200 }],
                        totalAmount: 200,
                        advanceRemaining: 100,
                        paymentMethod: "Online",
                    },
                    {
                        billNo: "B011",
                        date: "2025-03-07",
                        items: [{ product: "Paver Blocks", qty: 30, unit: "pieces", pricePerQty: 20, amount: 600 }],
                        totalAmount: 600,
                        advanceRemaining: 50,
                        paymentMethod: "Cheque",
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
                advance: { value: true, currentamount: 25000, showinadvance: true, paymentMethod: "Cash" },
                deleteuser: { value: false, date: "" },
                advanceHistory: [
                    {
                        transactionType: "Deposit",
                        amount: 2500,
                        date: "2025-03-02",
                    },
                    {
                        transactionType: "Refund",
                        amount: 2200,
                        date: "2025-03-02",
                    },
                ],
                bills: [
                    {
                        billNo: "B005",
                        date: "2025-03-02",
                        items: [{ product: "Crushed Stone Aggregate", qty: 15, unit: "kg", pricePerQty: 18, amount: 270 }],
                        totalAmount: 270,
                        advanceRemaining: 300,
                        paymentMethod: "Cash",
                    },
                    {
                        billNo: "B012",
                        date: "2025-03-03",
                        items: [{ product: "Cement OPC 53 Grade", qty: 4, unit: "bags", pricePerQty: 350, amount: 1400 }],
                        totalAmount: 1400,
                        advanceRemaining: 200,
                        paymentMethod: "Cheque",
                    },
                    {
                        billNo: "B013",
                        date: "2025-03-04",
                        items: [{ product: "M-Sand", qty: 8, unit: "kg", pricePerQty: 25, amount: 200 }],
                        totalAmount: 200,
                        advanceRemaining: 100,
                        paymentMethod: "Online",
                    },
                ],
            },
            {
                profileId: "g5np1x",
                name: "Priya Sharma [B]",
                advance: { value: true, currentamount: 23000, showinadvance: true, paymentMethod: "Cash" },
                showinadvance: true,
                deleteuser: { value: false, date: "" },
                advanceHistory: [
                    {
                        transactionType: "Deposit",
                        amount: 1500,
                        date: "2025-03-08",
                    },
                    {
                        transactionType: "Refund",
                        amount: 1000,
                        date: "2025-03-08",
                    },
                ],
                bills: [
                    {
                        billNo: "B021",
                        date: "2025-03-08",
                        items: [{ product: "Bricks", qty: 150, unit: "pieces", pricePerQty: 6, amount: 900 }],
                        totalAmount: 900,
                        advanceRemaining: 600,
                        paymentMethod: "Cash",
                    },
                    {
                        billNo: "B022",
                        date: "2025-03-09",
                        items: [{ product: "Red Soil", qty: 20, unit: "kg", pricePerQty: 10, amount: 200 }],
                        totalAmount: 200,
                        advanceRemaining: 500,
                        paymentMethod: "Online",
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
                advance: { value: true, currentamount: 10000, showinadvance: true, paymentMethod: "Cash" },
                showinadvance: true,
                deleteuser: { value: false, date: "" },
                advanceHistory: [
                    {
                        transactionType: "Deposit",
                        amount: 5000,
                        date: "2025-03-03",
                    },
                    {
                        transactionType: "Refund",
                        amount: 1500,
                        date: "2025-03-03",
                    },
                ],
                bills: [
                    {
                        billNo: "B006",
                        date: "2025-03-03",
                        items: [{ product: "Steel Reinforcement Bars", qty: 2, unit: "kg", pricePerQty: 75, amount: 150 }],
                        totalAmount: 150,
                        advanceRemaining: 3500,
                        paymentMethod: "Card",
                    },
                    {
                        billNo: "B014",
                        date: "2025-03-05",
                        items: [{ product: "Concrete Mix", qty: 3, unit: "bags", pricePerQty: 500, amount: 1500 }],
                        totalAmount: 1500,
                        advanceRemaining: 2000,
                        paymentMethod: "Card",
                    },
                    {
                        billNo: "B015",
                        date: "2025-03-06",
                        items: [{ product: "Red Soil", qty: 10, unit: "kg", pricePerQty: 20, amount: 200 }],
                        totalAmount: 200,
                        advanceRemaining: 1800,
                        paymentMethod: "Card",
                    },
                ],
            },
            {
                profileId: "zt82lp",
                name: "Ajay Patel [B]",
                advance: { value: true, currentamount: 12000, showinadvance: true, paymentMethod: "Cash" },
                showinadvance: true,
                deleteuser: { value: false, date: "" },
                advanceHistory: [
                    {
                        transactionType: "Deposit",
                        amount: 3000,
                        date: "2025-03-07",
                    },
                    {
                        transactionType: "Refund",
                        amount: 1200,
                        date: "2025-03-07",
                    },
                ],
                bills: [
                    {
                        billNo: "B016",
                        date: "2025-03-07",
                        items: [{ product: "Fly Ash", qty: 70, unit: "kg", pricePerQty: 5, amount: 350 }],
                        totalAmount: 350,
                        advanceRemaining: 2650,
                        paymentMethod: "Online",
                    },
                    {
                        billNo: "B017",
                        date: "2025-03-08",
                        items: [{ product: "M-Sand", qty: 15, unit: "kg", pricePerQty: 25, amount: 375 }],
                        totalAmount: 375,
                        advanceRemaining: 2275,
                        paymentMethod: "Cheque",
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
                advance: { value: false, currentamount: 0, showinadvance: false, paymentMethod: "online" },
                deleteuser: { value: false, date: "" },
                bills: [
                    {
                        billNo: "B007",
                        date: "2025-03-04",
                        items: [{ product: "Cement OPC 53 Grade", qty: 2, unit: "bags", pricePerQty: 350, amount: 700 }],
                        totalAmount: 700,
                        paymentMethod: "Cash",
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
                advance: { value: false, currentamount: 0, showinadvance: false, paymentMethod: null },
                deleteuser: { value: false, date: "" },
                bills: [
                    {
                        billNo: "B008",
                        date: "2025-03-05",
                        items: [
                            { product: "River Sand", qty: 15, unit: "kg", pricePerQty: 12, amount: 180 },
                            { product: "Crushed Stone Aggregate", qty: 10, unit: "kg", pricePerQty: 18, amount: 180 },
                        ],
                        totalAmount: 360,
                        paymentMethod: "Cash",
                    },
                ],
            },
            {
                profileId: "w4xm23",
                name: "Neha Gupta [B]",
                advance: { value: false, currentamount: 0, showinadvance: false, paymentMethod: null },
                deleteuser: { value: false, date: "" },
                bills: [
                    {
                        billNo: "B009",
                        date: "2025-03-06",
                        items: [
                            { product: "Steel Reinforcement Bars", qty: 2, unit: "kg", pricePerQty: 75, amount: 150 },
                            { product: "Cement OPC 53 Grade", qty: 3, unit: "bags", pricePerQty: 350, amount: 1050 },
                        ],
                        totalAmount: 1200,
                        paymentMethod: "Cash",
                    },
                ],
            },
        ],
    },
];

const customersData2 = [
    {
        phoneNumber: "9988776655",
        profiles: [
            {
                profileId: "s1k9mj",
                name: "Vikram Singh [A]",
                advance: { value: true, currentamount: 15000, showinadvance: true, paymentMethod: "online" },
                deleteuser: { value: false, date: "" },
                advanceHistory: [
                    {
                        transactionType: "Deposit",
                        amount: 1200,
                        date: "2025-03-10",
                    },
                    {
                        transactionType: "Refund",
                        amount: 500,
                        date: "2025-03-10",
                    },
                ],
                bills: [
                    {
                        billNo: "S201",
                        date: "2025-03-10",
                        items: [
                            { product: "Ready Mix Concrete", qty: 3, unit: "bags", pricePerQty: 450, amount: 1350 },
                        ],
                        totalAmount: 1350,
                        advanceRemaining: 700,
                        paymentMethod: "Cash",
                    },
                    {
                        billNo: "S202",
                        date: "2025-03-11",
                        items: [{ product: "Fly Ash Bricks", qty: 80, unit: "pieces", pricePerQty: 7, amount: 560 }],
                        totalAmount: 560,
                        advanceRemaining: 600,
                        paymentMethod: "Online",
                    },
                ],
            },
            {
                profileId: "l8z2fk",
                name: "Vikram Singh [B]",
                advance: { value: true, currentamount: 16000, showinadvance: true, paymentMethod: "online" },
                deleteuser: { value: false, date: "" },
                advanceTransactions: [
                    { date: "2025-03-12", amount: 1800, type: "given" },
                    { date: "2025-03-12", amount: 1500, type: "used" },
                ],
                advanceHistory: [
                    {
                        transactionType: "Deposit",
                        amount: 1800,
                        date: "2025-03-12",
                    },
                    {
                        transactionType: "Refund",
                        amount: 1500,
                        date: "2025-03-12",
                    },
                ],
                bills: [
                    {
                        billNo: "S203",
                        date: "2025-03-12",
                        items: [{ product: "Construction Chemicals", qty: 2, unit: "liters", pricePerQty: 400, amount: 800 }],
                        totalAmount: 800,
                        advanceRemaining: 1000,
                        paymentMethod: "Online",
                    },
                    {
                        billNo: "S204",
                        date: "2025-03-13",
                        items: [{ product: "Wall Putty", qty: 5, unit: "kg", pricePerQty: 100, amount: 500 }],
                        totalAmount: 500,
                        advanceRemaining: 500,
                        paymentMethod: "Cheque",
                    },
                ],
            },
        ],
    },
    {
        phoneNumber: "8899776655",
        profiles: [
            {
                profileId: "m3b1tv",
                name: "Anita Desai [A]",
                advance: { value: true, currentamount: 20000, showinadvance: true, paymentMethod: "online" },
                deleteuser: { value: false, date: "" },
                advanceHistory: [
                    {
                        transactionType: "Deposit",
                        amount: 2500,
                        date: "2025-03-11",
                    },
                    {
                        transactionType: "Refund",
                        amount: 1000,
                        date: "2025-03-11",
                    },
                ],
                bills: [
                    {
                        billNo: "S205",
                        date: "2025-03-11",
                        items: [{ product: "Concrete Blocks", qty: 40, unit: "pieces", pricePerQty: 25, amount: 1000 }],
                        totalAmount: 1000,
                        advanceRemaining: 1500,
                        paymentMethod: "Card",
                    },
                ],
            },
            {
                profileId: "j7w3rh",
                name: "Anita Desai [B]",
                advance: { value: true, currentamount: 30000, showinadvance: true, paymentMethod: "online" },
                deleteuser: { value: false, date: "" },
                advanceHistory: [
                    {
                        transactionType: "Deposit",
                        amount: 1000,
                        date: "2025-03-14",
                    },
                    {
                        transactionType: "Refund",
                        amount: 800,
                        date: "2025-03-14",
                    },
                ],
                bills: [
                    {
                        billNo: "S206",
                        date: "2025-03-14",
                        items: [{ product: "PVC Pipes", qty: 10, unit: "meters", pricePerQty: 50, amount: 500 }],
                        totalAmount: 500,
                        advanceRemaining: 300,
                        paymentMethod: "Cash",
                    },
                    {
                        billNo: "S207",
                        date: "2025-03-15",
                        items: [{ product: "Binding Wire", qty: 5, unit: "kg", pricePerQty: 60, amount: 300 }],
                        totalAmount: 300,
                        advanceRemaining: 200,
                        paymentMethod: "Online",
                    },
                ],
            },
        ],
    },
    {
        phoneNumber: "7788665544",
        profiles: [
            {
                profileId: "v9k6wl",
                name: "Rahul Joshi",
                advance: { value: false, currentamount: 0, showinadvance: false, paymentMethod: null },
                deleteuser: { value: false, date: "" },
                bills: [
                    {
                        billNo: "S208",
                        date: "2025-03-10",
                        items: [
                            { product: "Plaster of Paris", qty: 6, unit: "kg", pricePerQty: 90, amount: 540 },
                        ],
                        totalAmount: 540,
                        paymentMethod: "Cash",
                    },
                ],
            },
        ],
    },
    {
        phoneNumber: "6677554433",
        profiles: [
            {
                profileId: "n4p9xq",
                name: "Deepa Verma",
                advance: { value: false, currentamount: 0, showinadvance: false, paymentMethod: null },
                deleteuser: { value: false, date: "" },
                bills: [
                    {
                        billNo: "S209",
                        date: "2025-03-13",
                        items: [
                            { product: "Cement OPC 43 Grade", qty: 3, unit: "bags", pricePerQty: 330, amount: 990 },
                            { product: "Sand", qty: 20, unit: "kg", pricePerQty: 10, amount: 200 },
                        ],
                        totalAmount: 1190,
                        paymentMethod: "Cash",
                    },
                ],
            },
        ],
    },
];

export { customersData, customersData2 };