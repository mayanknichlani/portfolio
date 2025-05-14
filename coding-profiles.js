// Fetch LeetCode and Codeforces data
document.addEventListener("DOMContentLoaded", () => {
  fetchLeetCodeData()
  fetchCodeforcesData("mayank.nichlani22", "practice")
  fetchCodeforcesData("unknowncoder2805", "contest")
})

// LeetCode data fetching
async function fetchLeetCodeData() {
  const username = "mayanknichlani"
  const leetcodeLoading = document.getElementById("leetcode-loading")
  const leetcodeData = document.getElementById("leetcode-data")
  const leetcodeError = document.getElementById("leetcode-error")

  try {
    // Check if we have cached data
    const cachedData = localStorage.getItem("leetcode-data")
    const cachedTimestamp = localStorage.getItem("leetcode-timestamp")

    // Use cached data if it's less than 6 hours old
    if (cachedData && cachedTimestamp && Date.now() - Number.parseInt(cachedTimestamp) < 6 * 60 * 60 * 1000) {
      updateLeetCodeUI(JSON.parse(cachedData))
      return
    }

    // For Netlify deployment, use the Netlify function
    const response = await fetch(`/.netlify/functions/leetcode-data?username=${username}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const userData = await response.json()
    updateLeetCodeUI(userData)
  } catch (error) {
    console.error("Error fetching LeetCode data:", error)

    // Try to use cached data even if it's old
    const cachedData = localStorage.getItem("leetcode-data")
    if (cachedData) {
      updateLeetCodeUI(JSON.parse(cachedData))
    } else {
      // Fall back to simulated data if no cached data exists
      simulateLeetCodeData()
    }

    // Show error message briefly, then hide it after 3 seconds
    leetcodeError.style.display = "block"
    setTimeout(() => {
      leetcodeError.style.display = "none"
    }, 3000)
  }
}

// Update LeetCode UI with data
function updateLeetCodeUI(userData) {
  const leetcodeLoading = document.getElementById("leetcode-loading")
  const leetcodeData = document.getElementById("leetcode-data")
  const leetcodeError = document.getElementById("leetcode-error")

  // Update DOM with LeetCode data
  document.getElementById("leetcode-rating").textContent = userData.rating || "N/A"
  document.getElementById("leetcode-max-rating").textContent = userData.maxRating || "N/A"
  document.getElementById("leetcode-rank").textContent = userData.rank || "N/A"
  document.getElementById("leetcode-best-rank").textContent = userData.bestRank || "N/A"
  document.getElementById("leetcode-solved").textContent = userData.solved || "N/A"

  // Show data and hide loading/error
  leetcodeLoading.style.display = "none"
  leetcodeError.style.display = "none"
  leetcodeData.style.display = "block"

  // Cache the data
  localStorage.setItem("leetcode-data", JSON.stringify(userData))
  localStorage.setItem("leetcode-timestamp", Date.now().toString())
}

// Simulate LeetCode data for demonstration
function simulateLeetCodeData() {
  const userData = {
    rating: "1850",
    maxRating: "1950",
    rank: "Knight",
    bestRank: "1250",
    solved: "325",
  }

  updateLeetCodeUI(userData)
}

// Codeforces data fetching
async function fetchCodeforcesData(handle, accountType) {
  const codeforcesLoading = document.getElementById("codeforces-loading")
  const codeforcesError = document.getElementById("codeforces-error")
  const codeforcesData = document.getElementById(`codeforces-${accountType}-data`)

  try {
    // Check if we have cached data
    const cacheKey = `codeforces-${accountType}-data`
    const cachedData = localStorage.getItem(cacheKey)
    const cachedTimestamp = localStorage.getItem(`codeforces-${accountType}-timestamp`)

    // Use cached data if it's less than 6 hours old
    if (cachedData && cachedTimestamp && Date.now() - Number.parseInt(cachedTimestamp) < 6 * 60 * 60 * 1000) {
      updateCodeforcesUI(JSON.parse(cachedData), accountType)
      return
    }

    // Codeforces API doesn't have CORS restrictions, so we can call it directly
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`)

    if (!response.ok) {
      throw new Error("Codeforces API error")
    }

    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error("Codeforces API returned an error")
    }

    const userData = data.result[0]

    // Format the data
    const formattedData = {
      rating: userData.rating || "N/A",
      maxRating: userData.maxRating || "N/A",
      rank: userData.rank || "N/A",
    }

    // Update UI and cache data
    updateCodeforcesUI(formattedData, accountType)
  } catch (error) {
    console.error(`Error fetching Codeforces data for ${handle}:`, error)

    // Try to use cached data even if it's old
    const cacheKey = `codeforces-${accountType}-data`
    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      updateCodeforcesUI(JSON.parse(cachedData), accountType)
    } else {
      // Fallback to simulated data
      simulateCodeforcesData(accountType)
    }

    // Show error only if both accounts failed
    if (
      document.getElementById("codeforces-practice-data").style.display === "none" &&
      document.getElementById("codeforces-contest-data").style.display === "none"
    ) {
      codeforcesLoading.style.display = "none"
      codeforcesError.style.display = "block"

      // Hide error after 3 seconds
      setTimeout(() => {
        codeforcesError.style.display = "none"
      }, 3000)
    }
  }
}

// Update Codeforces UI with data
function updateCodeforcesUI(userData, accountType) {
  const codeforcesLoading = document.getElementById("codeforces-loading")
  const codeforcesData = document.getElementById(`codeforces-${accountType}-data`)

  // Update DOM with Codeforces data
  document.getElementById(`codeforces-${accountType}-rating`).textContent = userData.rating
  document.getElementById(`codeforces-${accountType}-max-rating`).textContent = userData.maxRating
  document.getElementById(`codeforces-${accountType}-rank`).textContent = userData.rank

  // Show data
  codeforcesData.style.display = "block"

  // Hide loading if both accounts are loaded
  if (
    document.getElementById("codeforces-practice-data").style.display === "block" &&
    document.getElementById("codeforces-contest-data").style.display === "block"
  ) {
    codeforcesLoading.style.display = "none"
  }

  // Cache the data
  const cacheKey = `codeforces-${accountType}-data`
  localStorage.setItem(cacheKey, JSON.stringify(userData))
  localStorage.setItem(`codeforces-${accountType}-timestamp`, Date.now().toString())
}

// Simulate Codeforces data for demonstration
function simulateCodeforcesData(accountType) {
  let userData

  if (accountType === "practice") {
    userData = {
      rating: "1650",
      maxRating: "1750",
      rank: "Expert",
    }
  } else {
    userData = {
      rating: "1450",
      maxRating: "1550",
      rank: "Specialist",
    }
  }

  updateCodeforcesUI(userData, accountType)
}
