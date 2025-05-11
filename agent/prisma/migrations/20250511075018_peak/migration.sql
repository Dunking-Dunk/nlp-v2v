-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "attitudeScore" INTEGER DEFAULT 0,
ADD COLUMN     "communicationScore" INTEGER DEFAULT 0,
ADD COLUMN     "culturalFitNotes" TEXT,
ADD COLUMN     "experienceRelevanceScore" INTEGER DEFAULT 0,
ADD COLUMN     "improvementAreasNotes" TEXT,
ADD COLUMN     "problemSolvingScore" INTEGER DEFAULT 0,
ADD COLUMN     "recommendationNotes" TEXT,
ADD COLUMN     "strengthsNotes" TEXT,
ADD COLUMN     "technicalFeedback" TEXT,
ADD COLUMN     "technicalSkillScore" INTEGER DEFAULT 0;
