# Partner Operations - Quick Checklist

**Use this checklist every redemption cycle. Full details in PARTNER_OPERATIONS.md**

---

## ☑️ Monday Morning (9-11 AM)

### Check Pool
- [ ] Run: `cd packages/contracts && pnpm tsx scripts/check-pool.ts`
- [ ] Record current pool size: **_____ trees**
- [ ] Decision:
  - [ ] Pool < 5 → Skip this week
  - [ ] Pool ≥ 5 → Proceed with redemption

### Contact Partner (if proceeding)
- [ ] WhatsApp message sent (10:00 AM)
- [ ] Quantity requested: **_____ trees**
- [ ] Expected planting date: **_____**
- [ ] Partner confirmed: ✅ / ⏳ waiting

### Document Request
- [ ] Create: `docs/redemptions/batch-XXX/request.txt`
- [ ] Fill in: quantity, date, cost estimate
- [ ] Set calendar reminder for Friday proof check

---

## ☑️ Tuesday-Thursday (Planting Window)

### Monitor Partner Communication
- [ ] Partner confirmed planting date
- [ ] No issues reported
- [ ] WhatsApp contact responsive

### If Issues Arise
- [ ] Partner can't fulfill → Negotiate alternatives
- [ ] Weather delays → Adjust timeline
- [ ] Questions from partner → Respond within 2 hours

---

## ☑️ Thursday-Friday (Proof Collection)

### Receive Proof
- [ ] Proof received via WhatsApp
- [ ] Minimum 3 photos received
- [ ] Photos show actual planting
- [ ] Date matches expected range
- [ ] Species mentioned match photos

### Verify Quality
- [ ] Photo quality: Good / Acceptable / Poor
- [ ] Location identifiable: Yes / No
- [ ] Red flags detected: None / [Describe]
- [ ] Additional proof requested: Yes / No

### Save Proof Locally
- [ ] Create folder: `docs/redemptions/batch-XXX/`
- [ ] Save all photos with descriptive names
- [ ] Create `proof-document.md` from template
- [ ] Add GPS coordinates (if provided)

### Upload to Public Storage
- [ ] Method used: Gist / IPFS / Drive
- [ ] Proof URL: **_____________________________**
- [ ] URL tested and accessible: ✅

---

## ☑️ Friday Afternoon (On-Chain Recording)

### Request Tech Team Action
- [ ] Message sent to tech team
- [ ] Included: quantity + proof URL
- [ ] Received confirmation: ✅ / ⏳ waiting

### Receive Transaction Details
- [ ] TX Hash: **_____________________________**
- [ ] Explorer Link: **_____________________________**
- [ ] Batch ID: **u_____**
- [ ] Status: Confirmed ✅

### Update Documentation
- [ ] Add TX info to `proof-document.md`
- [ ] Update `request.txt` with "COMPLETED" status
- [ ] Update batch tracking spreadsheet

---

## ☑️ Friday Evening (Invoice Request)

### Request Invoice from Partner
- [ ] WhatsApp message sent requesting invoice
- [ ] Total amount confirmed: **$_____ USD**
- [ ] Payment method confirmed: Bank / Cash / Crypto
- [ ] Expected invoice delivery: Saturday

---

## ☑️ Saturday (Payment & Announcement)

### Process Payment
- [ ] Invoice received from partner
- [ ] Amount matches agreement: **$_____ USD**
- [ ] Payment method: **_____**
- [ ] Payment sent: Date **_____ Time _____**
- [ ] Reference/TX: **_____________________________**

### Confirm with Partner
- [ ] WhatsApp confirmation sent
- [ ] Partner acknowledged receipt: ✅
- [ ] Thank you message sent

### Social Media (Optional)
- [ ] Twitter/X post drafted
- [ ] Proof link included
- [ ] Explorer link included
- [ ] Posted: ✅ / Skipped

### Discord/Community (Optional)
- [ ] Community update posted
- [ ] Impact Dashboard link shared
- [ ] Community engagement: ✅ / Skipped

---

## ☑️ End of Week (Wrap-Up)

### Update Tracking
- [ ] Payment log updated: `docs/finances/payment-log.csv`
- [ ] Batch completed in TODO.md: ✅
- [ ] Next redemption date scheduled: **_____**

### Review Performance
- [ ] Partner response time: **_____ hours**
- [ ] Proof quality: Excellent / Good / Fair / Poor
- [ ] Any issues: None / [Describe]
- [ ] Notes for next cycle: **_____________________________**

---

## 🚨 Emergency Procedures (If Needed)

### Partner Doesn't Respond (48+ hours)
- [ ] Follow-up WhatsApp sent
- [ ] Phone call attempted
- [ ] Backup partner contacted: Yes / No

### Proof Looks Suspicious
- [ ] Additional photos requested
- [ ] Site visit scheduled: Date **_____**
- [ ] Payment held: ✅
- [ ] Team discussion scheduled

### Payment Delayed (Your Side)
- [ ] Partner notified: Date **_____ Time _____**
- [ ] Reason explained
- [ ] New payment date: **_____**
- [ ] Partner agreed: ✅

---

## 📊 Monthly Review (First Monday of Month)

### Performance Metrics
- [ ] Batches completed this month: **_____**
- [ ] Total trees planted: **_____**
- [ ] Average cost per tree: **$_____**
- [ ] Average response time: **_____ hours**
- [ ] Issues encountered: **_____**

### Partner Relationship
- [ ] Communication: Excellent / Good / Fair / Poor
- [ ] Proof quality: Excellent / Good / Fair / Poor
- [ ] Reliability: Excellent / Good / Fair / Poor
- [ ] Overall satisfaction: Excellent / Good / Fair / Poor

### Action Items
- [ ] Continue partnership as-is: ✅
- [ ] Negotiate new terms: [Specify]
- [ ] Address concerns: [Specify]
- [ ] Consider alternatives: Yes / No

---

## 📞 Quick Reference

**Current Partner:**
- Name: Jardín Botánico del Quindío
- Phone: 3153349307
- Email: investigaciones@jardinbotanicoquindio.org
- Cost: $2 USD per tree

**Tech Team Contact:**
- Name: [Fill in]
- WhatsApp: [Fill in]
- Available: [Fill in]

**Next Redemption:**
- Date: Every other Monday
- Time: 10:00 AM COT
- Next: **_____**

---

## ✅ Batch Completion Criteria

**Before marking batch as complete:**
- [x] Trees planted and proof received
- [x] Proof verified and uploaded publicly
- [x] Transaction recorded on-chain
- [x] Payment sent and confirmed
- [x] Documentation updated
- [x] Community notified (optional)

**Batch is COMPLETE when all above are checked ✅**

---

**Print this checklist and use it for each redemption cycle.**
**For detailed instructions, see PARTNER_OPERATIONS.md**
