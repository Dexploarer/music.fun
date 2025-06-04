import React from 'react';

interface VenueRentalTemplateProps {
  venueName?: string;
  venueAddress?: string;
  venuePhone?: string;
  venueEmail?: string;
  renterName?: string;
  renterAddress?: string;
  renterEmail?: string;
  renterPhone?: string;
  eventType?: string;
  eventDate?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  setupTime?: string;
  teardownTime?: string;
  rentalFee?: string;
  depositAmount?: string;
  expectedAttendance?: string;
  alcoholServed?: string;
  additionalServices?: string;
  additionalTerms?: string;
}

export const VenueRentalTemplate: React.FC<VenueRentalTemplateProps> = ({
  venueName = 'The Train Station',
  venueAddress = '4671 5th Street, Corbin, KY 40701',
  venuePhone = '(606) 555-1234',
  venueEmail = 'contact@thetrainstation.com',
  renterName = '[RENTER NAME]',
  renterAddress = '[RENTER ADDRESS]',
  renterEmail = '[RENTER EMAIL]',
  renterPhone = '[RENTER PHONE]',
  eventType = '[EVENT TYPE]',
  eventDate = '[EVENT DATE]',
  eventStartTime = '[START TIME]',
  eventEndTime = '[END TIME]',
  setupTime = '[SETUP TIME]',
  teardownTime = '[TEARDOWN TIME]',
  rentalFee = '[RENTAL FEE]',
  depositAmount = '[DEPOSIT AMOUNT]',
  expectedAttendance = '[EXPECTED ATTENDANCE]',
  alcoholServed = '[YES/NO]',
  additionalServices = '[ADDITIONAL SERVICES]',
  additionalTerms = '[ADDITIONAL TERMS]'
}) => {
  const contractText = `
VENUE RENTAL AGREEMENT

This Venue Rental Agreement (the "Agreement") is entered into on [DATE] by and between:

VENUE OWNER: ${venueName}
Address: ${venueAddress}
Phone: ${venuePhone}
Email: ${venueEmail}

AND

RENTER: ${renterName}
Address: ${renterAddress}
Phone: ${renterPhone}
Email: ${renterEmail}

WHEREAS, Venue Owner wishes to rent the venue to Renter, and Renter wishes to rent the venue from Venue Owner, the parties agree as follows:

1. VENUE RENTAL
   Venue Owner agrees to rent to Renter the premises located at ${venueAddress} (the "Venue") for the purpose of hosting ${eventType}.

2. RENTAL PERIOD
   2.1. Event Date: ${eventDate}
   2.2. Setup Time: ${setupTime}
   2.3. Event Start Time: ${eventStartTime}
   2.4. Event End Time: ${eventEndTime}
   2.5. Teardown Completion Time: ${teardownTime}

3. RENTAL FEE AND DEPOSIT
   3.1. Rental Fee: $${rentalFee}
   3.2. Security/Damage Deposit: $${depositAmount}
   3.3. Payment Schedule:
        a. 50% of the Rental Fee ($${parseFloat(rentalFee)/2}) and the full Security/Damage Deposit ($${depositAmount}) are due at signing of this Agreement.
        b. The remaining balance of $${parseFloat(rentalFee)/2} is due no later than 14 days prior to the Event Date.
   3.4. Security/Damage Deposit shall be refunded within 7 business days after the event, less any deductions for damages, excessive cleaning, or overtime charges.

4. ATTENDEES AND CAPACITY
   4.1. Expected Number of Attendees: ${expectedAttendance}
   4.2. Renter acknowledges that Venue has a maximum capacity of 250 persons as determined by the Fire Marshal.
   4.3. Renter agrees not to exceed this maximum capacity under any circumstances.

5. FOOD AND BEVERAGES
   5.1. Alcohol will be served: ${alcoholServed}
   5.2. If alcohol is to be served, Renter is responsible for ensuring compliance with all applicable laws and regulations.
   5.3. If alcohol is to be served, Renter must provide proof of appropriate insurance and licenses at least 14 days prior to the Event Date.

6. ADDITIONAL SERVICES PROVIDED BY VENUE
   ${additionalServices}

7. RENTER'S RESPONSIBILITIES
   7.1. Renter shall use the Venue only for the purpose stated in this Agreement.
   7.2. Renter shall comply with all applicable laws, regulations, and Venue policies.
   7.3. Renter shall not make any alterations to the Venue without prior written consent.
   7.4. Renter shall be responsible for the conduct of all attendees.
   7.5. Renter shall leave the Venue in the same condition as it was provided, reasonable wear and tear excepted.
   7.6. Renter shall remove all personal property and equipment from the Venue by the Teardown Completion Time.

8. CANCELLATION POLICY
   8.1. Cancellation by Renter:
        a. 60+ days prior to Event Date: Full refund of Rental Fee, less a $100 administrative fee. Security/Damage Deposit refunded in full.
        b. 30-59 days prior to Event Date: 50% refund of Rental Fee paid. Security/Damage Deposit refunded in full.
        c. Less than 30 days prior to Event Date: No refund of Rental Fee. Security/Damage Deposit refunded in full.
   8.2. Cancellation by Venue Owner:
        a. In the event of circumstances beyond the control of Venue Owner (e.g., natural disaster, fire), Venue Owner may cancel this Agreement, and Renter shall receive a full refund of all amounts paid.
        b. Venue Owner reserves the right to cancel this Agreement for any reason up to 90 days prior to the Event Date, in which case Renter shall receive a full refund of all amounts paid.

9. INDEMNIFICATION AND INSURANCE
   9.1. Renter agrees to indemnify and hold harmless Venue Owner from any claims, damages, losses, liabilities, costs, and expenses arising from Renter's use of the Venue.
   9.2. Renter shall provide proof of liability insurance covering the event with minimum coverage of $1,000,000 per occurrence, naming Venue Owner as an additional insured.

10. ADDITIONAL TERMS
    ${additionalTerms}

11. ENTIRE AGREEMENT AND GOVERNING LAW
    11.1. This Agreement contains the entire understanding between the parties and supersedes all prior agreements.
    11.2. This Agreement shall be governed by and construed in accordance with the laws of the State of Kentucky.
    11.3. Any modifications to this Agreement must be in writing and signed by both parties.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

For Venue Owner:                    For Renter:

__________________________         __________________________
(Signature)                         (Signature)

__________________________         __________________________
(Printed Name)                      (Printed Name)

__________________________         __________________________
(Date)                              (Date)
`;

  return contractText;
};

export default VenueRentalTemplate;