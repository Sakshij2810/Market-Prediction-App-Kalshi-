// --------------------------------- market's controllers ---------------------------------

// Create market
export const createMarket = async (req, res) => {
  try {
    console.log("hi from createMarket controller");
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// List All  markets
export const listAllMarkets = async (req, res) => {
  try {
    console.log("hi from listAllMarkets controller");
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --------------------------------- bet's controllers ---------------------------------

// Place bet
export const placeBet = async (req, res) => {
  try {
    console.log("hi from placeBet controller");
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// User's All bets
export const listAllBets = async (req, res) => {
  try {
    console.log("hi from listAllBets controller");
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
