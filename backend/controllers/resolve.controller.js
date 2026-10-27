// Resolve market
export const resolveMarket = async (req, res) => {
  try {
    console.log("hi from resolveMarket");
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};
