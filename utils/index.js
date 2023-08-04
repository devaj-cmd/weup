// Function to paginate the results

const paginateResults = (results, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResults = results.slice(startIndex, endIndex);

  return {
    users: paginatedResults,
    totalResults: results.length,
    currentPage: page,
    limit: limit,
  };
};

// Function to calculate age similarity score
const calculateAgeSimilarity = (loggedInUserAge, otherUserAge) => {
  const minAge1 = loggedInUserAge[0];
  const maxAge1 = loggedInUserAge[1];
  const minAge2 = otherUserAge[0];
  const maxAge2 = otherUserAge[1];

  const maxMinAgeDiff = Math.max(minAge1 - maxAge2, minAge2 - maxAge1);
  const minMaxAgeDiff = Math.min(maxAge1 - minAge2, maxAge2 - minAge1);
  const ageDiff = Math.max(0, maxMinAgeDiff, minMaxAgeDiff);

  const maxAgeDiff = maxAge1 - minAge1 + maxAge2 - minAge2;
  const ageSimilarity = 1 - ageDiff / maxAgeDiff;

  return ageSimilarity;
};

// Function to convert height in feet and inches to inches
const convertFootInchesToInches = (height) => {
  const [feet, inches] = height.split("'");
  const totalInches =
    parseInt(feet) * 12 + (inches ? parseInt(inches.replace('"', "")) : 0);
  return totalInches;
};

// Function to calculate height similarity
const calculateHeightSimilarity = (loggedInUserHeight, otherUserHeight) => {
  const loggedInUserMinInches = convertFootInchesToInches(
    loggedInUserHeight[0]
  );
  const loggedInUserMaxInches = convertFootInchesToInches(
    loggedInUserHeight[1]
  );
  const otherUserMinInches = convertFootInchesToInches(otherUserHeight[0]);
  const otherUserMaxInches = convertFootInchesToInches(otherUserHeight[1]);

  // Check if the height ranges overlap or not
  if (
    loggedInUserMinInches > otherUserMaxInches ||
    loggedInUserMaxInches < otherUserMinInches
  ) {
    return 0; // No overlap, height ranges are completely different
  }

  // Find the intersection of the height ranges
  const intersectionMin = Math.max(loggedInUserMinInches, otherUserMinInches);
  const intersectionMax = Math.min(loggedInUserMaxInches, otherUserMaxInches);

  const intersectionDiff = intersectionMax - intersectionMin;
  const heightDiff = loggedInUserMaxInches - loggedInUserMinInches;

  const heightSimilarity = intersectionDiff / heightDiff;

  return heightSimilarity;
};
// Function to calculate similarity score based on user preference
const calculateSimilarity = (loggedInUser, otherUser) => {
  const loggedInUserPreference = loggedInUser.preference;
  const otherUserPreference = otherUser.preference;
  let score = 0;

  // Age similarity
  const ageScore = calculateAgeSimilarity(
    loggedInUserPreference.age,
    otherUserPreference.age
  );
  score += ageScore;

  // Height similarity
  const heightScore = calculateHeightSimilarity(
    loggedInUserPreference.height,
    otherUserPreference.height
  );
  score += heightScore;

  // Distance similarity
  const distanceScore =
    otherUserPreference.distance <= loggedInUserPreference.distance ? 1 : 0;
  score += distanceScore;

  // Ethnicity similarity
  const ethnicityScore =
    loggedInUserPreference.ethnicity === otherUserPreference.ethnicity ? 1 : 0;
  score += ethnicityScore;

  // Religion similarity
  const religionScore =
    loggedInUserPreference.religion === otherUserPreference.religion ? 1 : 0;
  score += religionScore;

  // Relationship goals similarity
  const relationshipGoalsScore =
    loggedInUserPreference.relationshipGoals ===
    otherUserPreference.relationshipGoals
      ? 1
      : 0;
  score += relationshipGoalsScore;

  // Smoking similarity
  const smokingScore =
    loggedInUserPreference.smoking === otherUserPreference.smoking ? 1 : 0;
  score += smokingScore;

  // Education similarity
  const educationScore =
    loggedInUserPreference.education === otherUserPreference.education ? 1 : 0;
  score += educationScore;

  // Drinking similarity
  const drinkingScore =
    loggedInUserPreference.drinking === otherUserPreference.drinking ? 1 : 0;
  score += drinkingScore;

  // Kids similarity
  const kidsScore =
    loggedInUserPreference.kids === otherUserPreference.kids ? 1 : 0;
  score += kidsScore;

  // Interested gender similarity
  const interestedGenderScore =
    loggedInUserPreference.interested_gender === otherUserPreference.gender
      ? 1
      : 0;
  score += interestedGenderScore;

  const interestsScore = calculateInterestsSimilarity(
    loggedInUser.my_interests,
    otherUser.my_interests
  );

  score += interestsScore;

  return parseFloat(score.toFixed(2)); //
};

const calculateInterestsSimilarity = (
  loggedInUserInterests,
  otherUserInterests
) => {
  const commonInterests = loggedInUserInterests.filter((interest) =>
    otherUserInterests.includes(interest)
  );

  const similarity =
    commonInterests.length /
    Math.max(loggedInUserInterests.length, otherUserInterests.length);

  return similarity;
};

module.exports = {
  paginateResults,
  calculateSimilarity,
};
