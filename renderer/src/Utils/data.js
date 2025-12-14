export const units = [
  { label: "Set", value: "set" },
  { label: "Piece", value: "piece" },
  { label: "Dozen", value: "dozen" },
];

export const discount = [
  {
    label: "10%",
    value: 10,
  },
  {
    label: "15%",
    value: 15,
  },
  {
    label: "20%",
    value: 20,
  },
  {
    label: "0%",
    value: 0,
  },
];

export const size = [
  {
    id: 1,
    size: 22,
  },
  {
    id: 2,
    size: 24,
  },
  {
    id: 3,
    size: 26,
  },
];

export const Allitems = [
  {
    itemID: "ITemsid1",
    itemName: "Sample1",
    unit: "piece",
    price: "",
    variants: [
      { size: "22", price: "230" },
      { size: "24", price: "250" },
    ],
    hasVariants: true,
  },
  {
    itemID: "ITemsid2",
    itemName: "Sample12",
    unit: "piece",
    price: "350",
    hasVariants: false,
  },

  // ---- New 10 Records ----

  {
    itemID: "ITemsid3",
    itemName: "Sample2",
    unit: "kg",
    price: "",
    variants: [
      { size: "1kg", price: "120" },
      { size: "2kg", price: "220" },
    ],
    hasVariants: true,
  },
  {
    itemID: "ITemsid4",
    itemName: "Sample3",
    unit: "liter",
    price: "90",
    hasVariants: false,
  },
  {
    itemID: "ITemsid5",
    itemName: "Sample4",
    unit: "piece",
    price: "",
    variants: [
      { size: "S", price: "150" },
      { size: "M", price: "170" },
      { size: "L", price: "190" },
    ],
    hasVariants: true,
  },
  {
    itemID: "ITemsid6",
    itemName: "Sample5",
    unit: "box",
    price: "450",
    hasVariants: false,
  },
  {
    itemID: "ITemsid7",
    itemName: "Sample6",
    unit: "packet",
    price: "",
    variants: [
      { size: "Small", price: "40" },
      { size: "Large", price: "70" },
    ],
    hasVariants: true,
  },
  {
    itemID: "ITemsid8",
    itemName: "Sample7",
    unit: "piece",
    price: "65",
    hasVariants: false,
  },
  {
    itemID: "ITemsid9",
    itemName: "Sample8",
    unit: "kg",
    price: "",
    variants: [
      { size: "500g", price: "80" },
      { size: "1kg", price: "150" },
    ],
    hasVariants: true,
  },
  {
    itemID: "ITemsid10",
    itemName: "Sample9",
    unit: "set",
    price: "600",
    hasVariants: false,
  },
  {
    itemID: "ITemsid11",
    itemName: "Sample10",
    unit: "piece",
    price: "",
    variants: [
      { size: "Standard", price: "300" },
      { size: "Premium", price: "450" },
    ],
    hasVariants: true,
  },
  {
    itemID: "ITemsid12",
    itemName: "Sample11",
    unit: "bottle",
    price: "120",
    hasVariants: false,
  },
];
