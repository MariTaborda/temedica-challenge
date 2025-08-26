-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('FEMALE', 'MALE');

-- CreateTable
CREATE TABLE "public"."patients" (
    "id" SERIAL NOT NULL,
    "year_of_birth" INTEGER NOT NULL,
    "sex" "public"."Gender" NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claims" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "submission_date" TIMESTAMP(3) NOT NULL,
    "reimbursement_date" TIMESTAMP(3) NOT NULL,
    "total_cost" INTEGER NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prescriptions" (
    "id" SERIAL NOT NULL,
    "claim_id" INTEGER NOT NULL,
    "drug_code_atc" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "line_cost" INTEGER NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."claim_diagnoses" (
    "id" SERIAL NOT NULL,
    "claim_id" INTEGER NOT NULL,
    "icd10_code" INTEGER NOT NULL,

    CONSTRAINT "claim_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_claim_patient" ON "public"."claims"("patient_id");

-- CreateIndex
CREATE INDEX "idx_claim_submission_date" ON "public"."claims"("submission_date");

-- CreateIndex
CREATE INDEX "idx_claim_reimbursement_date" ON "public"."claims"("reimbursement_date");

-- CreateIndex
CREATE INDEX "idx_prescription_drug_code_atc" ON "public"."prescriptions"("drug_code_atc");

-- AddForeignKey
ALTER TABLE "public"."claims" ADD CONSTRAINT "claims_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."claim_diagnoses" ADD CONSTRAINT "claim_diagnoses_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddConstraint
ALTER TABLE "public"."claims" ADD CONSTRAINT "claims_submission_reimbursement_check" CHECK ("submission_date" < "reimbursement_date");

-- AddConstraint
ALTER TABLE "public"."claims" ADD CONSTRAINT "claims_total_cost_check" CHECK ("total_cost" >= 0);

-- AddConstraint
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_quantity_check" CHECK ("quantity" >= 0);

-- AddConstraint
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_line_cost_check" CHECK ("line_cost" >= 0);