import React from 'react';

interface TechnicalRiderTemplateProps {
  venueName?: string;
  venueAddress?: string;
  venueContact?: string;
  venuePhone?: string;
  venueEmail?: string;
  artistName?: string;
  eventDate?: string;
  stageSize?: string;
  soundSystem?: string;
  lighting?: string;
  backline?: string;
  monitoring?: string;
  inputList?: string;
  stagehands?: string;
  loadIn?: string;
  soundcheck?: string;
  additionalRequirements?: string;
}

export const TechnicalRiderTemplate: React.FC<TechnicalRiderTemplateProps> = ({
  venueName = 'The Train Station',
  venueAddress = '4671 5th Street, Corbin, KY 40701',
  venueContact = '[VENUE CONTACT]',
  venuePhone = '(606) 555-1234',
  venueEmail = 'contact@thetrainstation.com',
  artistName = '[ARTIST NAME]',
  eventDate = '[EVENT DATE]',
  stageSize = '[STAGE SIZE]',
  soundSystem = '[SOUND SYSTEM SPECIFICATIONS]',
  lighting = '[LIGHTING SPECIFICATIONS]',
  backline = '[BACKLINE REQUIREMENTS]',
  monitoring = '[MONITORING REQUIREMENTS]',
  inputList = '[INPUT LIST]',
  stagehands = '[NUMBER OF STAGEHANDS]',
  loadIn = '[LOAD-IN TIME]',
  soundcheck = '[SOUNDCHECK TIME]',
  additionalRequirements = '[ADDITIONAL REQUIREMENTS]'
}) => {
  const riderText = `
TECHNICAL RIDER - ${artistName}

Event Date: ${eventDate}
Venue: ${venueName}
Address: ${venueAddress}

Venue Contact: ${venueContact}
Phone: ${venuePhone}
Email: ${venueEmail}

This technical rider is an integral part of the contract between ${artistName} ("Artist") and ${venueName} ("Venue") for the performance on ${eventDate}. Please read it carefully as any modification must be approved in writing by Artist's management.

1. STAGE
   Stage Dimensions: ${stageSize}
   The stage must be stable, level, clean, and clear of all equipment not related to Artist's performance.

2. SOUND SYSTEM
   ${soundSystem}

   The Venue shall provide a professional quality stereo sound system capable of producing a clear, undistorted sound at 105dB SPL at the FOH mixing position and even coverage of the entire audience area.
   
   System must include:
   - FOH console with at least 16 channels
   - Appropriate amplification for main speakers
   - Subwoofers
   - All necessary processing and effects

3. LIGHTING
   ${lighting}
   
   The Venue shall provide a professional lighting system suitable for a concert performance.
   - Front, overhead, and back lighting
   - Ability to create different colored washes
   - Lighting console and operator

4. BACKLINE
   The following backline equipment is required:
   ${backline}

5. MONITORING SYSTEM
   ${monitoring}
   
   At minimum, the Venue shall provide:
   - 4 monitor wedges
   - Monitor console separate from FOH (for larger venues)
   - Monitor engineer (for larger venues)

6. INPUT LIST & STAGE PLOT
   ${inputList}
   
   (Detailed input list and stage plot to be provided separately)

7. STAFF
   The Venue shall provide:
   - FOH sound engineer
   - Monitor engineer (if applicable)
   - Lighting technician
   - ${stagehands} stagehands to assist with load-in and load-out

8. SCHEDULE
   - Load-in: ${loadIn}
   - Soundcheck: ${soundcheck}
   - Doors: [DOORS TIME]
   - Show time: [SHOW TIME]

9. POWER
   The Venue shall provide sufficient power for Artist's equipment:
   - Sound: Minimum 2 separate 20 amp circuits
   - Lighting: Separate circuits from sound
   - On-stage power drops as specified in stage plot

10. ADDITIONAL REQUIREMENTS
    ${additionalRequirements}

11. AGREEMENT
    This technical rider is considered a part of the contract. Any changes must be approved in writing by Artist's management. Failure to provide the requirements specified herein may result in Artist's inability to perform.

For the Venue:                     For the Artist:

__________________________        __________________________
(Signature)                        (Signature)

__________________________        __________________________
(Printed Name)                     (Printed Name)

__________________________        __________________________
(Date)                             (Date)
`;

  return riderText;
};

export default TechnicalRiderTemplate;