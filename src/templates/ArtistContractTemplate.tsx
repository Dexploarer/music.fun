import React from 'react';

interface ArtistContractTemplateProps {
  venueName?: string;
  venueAddress?: string;
  venuePhone?: string;
  venueEmail?: string;
  artistName?: string;
  artistAddress?: string;
  artistEmail?: string;
  artistPhone?: string;
  eventDate?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  paymentAmount?: string;
  depositAmount?: string;
  soundcheckTime?: string;
  performanceDuration?: string;
  additionalTerms?: string;
}

export const ArtistContractTemplate: React.FC<ArtistContractTemplateProps> = ({
  venueName = 'The Train Station',
  venueAddress = '4671 5th Street, Corbin, KY 40701',
  venuePhone = '(606) 555-1234',
  venueEmail = 'contact@thetrainstation.com',
  artistName = '[ARTIST NAME]',
  artistAddress = '[ARTIST ADDRESS]',
  artistEmail = '[ARTIST EMAIL]',
  artistPhone = '[ARTIST PHONE]',
  eventDate = '[EVENT DATE]',
  eventStartTime = '[START TIME]',
  eventEndTime = '[END TIME]',
  paymentAmount = '[PAYMENT AMOUNT]',
  depositAmount = '[DEPOSIT AMOUNT]',
  soundcheckTime = '[SOUNDCHECK TIME]',
  performanceDuration = '[PERFORMANCE DURATION]',
  additionalTerms = '[ADDITIONAL TERMS]'
}) => {
  const contractText = `
ARTIST PERFORMANCE AGREEMENT

This Artist Performance Agreement (the "Agreement") is entered into on [DATE] by and between:

VENUE: ${venueName}
Address: ${venueAddress}
Phone: ${venuePhone}
Email: ${venueEmail}

AND

ARTIST: ${artistName}
Address: ${artistAddress}
Phone: ${artistPhone}
Email: ${artistEmail}

WHEREAS, Venue wishes to engage Artist for a performance, and Artist wishes to provide such services to Venue, the parties agree as follows:

1. ENGAGEMENT
   Venue engages Artist, and Artist accepts such engagement, to perform at ${venueName} on ${eventDate} from ${eventStartTime} to ${eventEndTime}.

2. PERFORMANCE
   Artist shall provide a musical performance of approximately ${performanceDuration}. Artist shall arrive at least ${soundcheckTime} before the scheduled performance time for sound check and setup.

3. COMPENSATION
   3.1. Venue shall pay Artist the sum of $${paymentAmount} for the performance.
   3.2. A non-refundable deposit of $${depositAmount} is due upon signing this Agreement.
   3.3. The remaining balance shall be paid to Artist immediately following the performance.
   3.4. Method of payment shall be by venue check, unless otherwise agreed upon.

4. CANCELLATION
   4.1. If Artist cancels the performance for any reason other than an illness or Act of God, Artist shall provide Venue with notice as far in advance as possible and shall use best efforts to provide a comparable replacement act.
   4.2. If Venue cancels the performance for any reason other than an Act of God, Venue shall pay Artist 50% of the agreed-upon fee if cancellation occurs less than 30 days prior to the performance.

5. EQUIPMENT AND TECHNICAL REQUIREMENTS
   5.1. Venue shall provide a suitable stage or performance area, basic sound equipment, lighting, and a technician.
   5.2. Artist shall provide personal instruments and equipment as agreed upon by both parties.
   5.3. Any specific technical requirements shall be provided by Artist to Venue at least 14 days prior to the performance date.

6. PROMOTION AND PUBLICITY
   6.1. Venue shall be responsible for all promotion and advertising of the performance.
   6.2. Artist grants Venue permission to use Artist's name, likeness, and biographical material for promotional purposes related to the performance.
   6.3. Artist agrees to promote the performance through social media and other channels.

7. RECORDING AND PHOTOGRAPHY
   7.1. Limited audio and video recording and photography by Venue for promotional purposes is permitted.
   7.2. All other recording rights are retained by Artist unless otherwise agreed upon in writing.

8. MERCHANDISE
   8.1. Artist shall have the right to sell merchandise at the performance.
   8.2. Venue shall provide a suitable area for merchandise sales.
   8.3. Artist retains 100% of merchandise revenue unless otherwise agreed upon.

9. ADDITIONAL TERMS
   ${additionalTerms}

10. ENTIRE AGREEMENT AND GOVERNING LAW
    10.1. This Agreement contains the entire understanding between the parties and supersedes all prior agreements.
    10.2. This Agreement shall be governed by and construed in accordance with the laws of the State of Kentucky.
    10.3. Any modifications to this Agreement must be in writing and signed by both parties.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

For Venue:                          For Artist:

__________________________         __________________________
(Signature)                         (Signature)

__________________________         __________________________
(Printed Name)                      (Printed Name)

__________________________         __________________________
(Date)                              (Date)
`;

  return contractText;
};

export default ArtistContractTemplate;