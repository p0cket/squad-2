export type ColorProperties = {
  hexGray: string
  hexWhite: string
  text: string
  bg: string
}
export type Themes = {
  light: {
    primary: ColorProperties
    secondary: ColorProperties
    accent: ColorProperties
    // Add more theme colors as needed
  }
  dark: {
    primary: ColorProperties
    secondary: ColorProperties
    accent: ColorProperties
    // Add more theme colors as needed
  }
}

export const themes: Themes = {
  light: {
    primary: {
      hexGray: "#374151", // Tailwind Gray-700
      hexWhite: "#FFFFFF", // White
      text: "text-gray-700",
      bg: "bg-white",
    },
    secondary: {
      hexGray: "#6B7280", // Tailwind Gray-500
      hexWhite: "#F3F4F6", // Tailwind Gray-100
      text: "text-gray-500",
      bg: "bg-gray-100",
    },
    accent: {
      hexGray: "#3B82F6", // Tailwind Blue-500
      hexWhite: "#EFF6FF", // Tailwind Blue-100
      text: "text-blue-500",
      bg: "bg-blue-100",
    },
    // Add more theme colors as needed
  },
  dark: {
    primary: {
      hexGray: "#D1D5DB", // Tailwind Gray-300
      hexWhite: "#1F2937", // Tailwind Gray-800
      text: "text-gray-300",
      bg: "bg-gray-800",
    },
    secondary: {
      hexGray: "#9CA3AF", // Tailwind Gray-400
      hexWhite: "#4B5563", // Tailwind Gray-600
      text: "text-gray-400",
      bg: "bg-gray-600",
    },
    accent: {
      hexGray: "#60A5FA", // Tailwind Blue-400
      hexWhite: "#2563EB", // Tailwind Blue-600
      text: "text-blue-400",
      bg: "bg-blue-600",
    },
    // Add more theme colors as needed
  },
}
