import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StaticPageWrapper } from "@/components/StaticPageWrapper";
import { ShieldAlert, FileText, Cookie } from "lucide-react";

const SITE_URL = "https://resumeflow.harshithkumar.in";

interface ContentBlock {
  title: string;
  subtitle: string;
  category: string;
  icon: ReactNode;
  body: ReactNode;
}

const titleMeta: Record<string, string> = {
  privacy: "Privacy Policy — ResumeFlow AI Resume Builder",
  terms: "Terms of Service — ResumeFlow AI Resume Builder",
  cookies: "Cookie Policy — ResumeFlow AI Resume Builder",
  contact: "Contact Us & Support — ResumeFlow AI Resume Builder",
};

const descriptionMeta: Record<string, string> = {
  privacy:
    "Read the ResumeFlow privacy policy. Learn how we collect, protect, and process your personal data when you use our AI resume builder platform.",
  terms:
    "Read the ResumeFlow terms of service. Understand the rules and guidelines governing your use of our AI-powered resume engineering platform.",
  cookies:
    "Learn how ResumeFlow uses cookies and local storage to provide a secure, seamless resume building experience.",
  contact:
    "Contact the ResumeFlow team for support, business inquiries, partnership requests, or privacy assistance.",
};

const legalContent: Record<string, ContentBlock> = {
  privacy: {
    category: "Legal & Privacy",
    title: "Privacy Policy",
    subtitle: "How we collect, protect, and process your personal data when you use ResumeFlow.",
    icon: <ShieldAlert className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-6 text-xs md:text-sm">
        <p className="text-slate-500 italic">Last updated: July 16, 2026</p>
        <p className="text-slate-600 leading-relaxed">
          This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
        </p>
        <p className="text-slate-600 leading-relaxed">
          We use Your Personal Data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
        </p>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Interpretation and Definitions</h2>
          <h3 className="text-sm font-semibold text-slate-700">Interpretation</h3>
          <p className="text-slate-600 leading-relaxed">The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
          <h3 className="text-sm font-semibold text-slate-700">Definitions</h3>
          <p className="text-slate-600 leading-relaxed">For the purposes of this Privacy Policy:</p>
          <ul className="list-disc pl-5 space-y-3 text-slate-600">
            <li><strong className="text-slate-800">Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
            <li><strong className="text-slate-800">Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
            <li><strong className="text-slate-800">Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Privacy Policy) refers to Resume Flow.</li>
            <li><strong className="text-slate-800">Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</li>
            <li><strong className="text-slate-800">Country</strong> refers to: Telangana, India.</li>
            <li><strong className="text-slate-800">Device</strong> means any device that can access the Service such as a computer, a cell phone or a digital tablet.</li>
            <li><strong className="text-slate-800">Personal Data</strong> (or &quot;Personal Information&quot;) is any information that relates to an identified or identifiable individual. We use &quot;Personal Data&quot; and &quot;Personal Information&quot; interchangeably unless a law uses a specific term.</li>
            <li><strong className="text-slate-800">Service</strong> refers to the Website.</li>
            <li><strong className="text-slate-800">Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</li>
            <li><strong className="text-slate-800">Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</li>
            <li><strong className="text-slate-800">Website</strong> refers to Resume Flow, accessible from <a href="https://resumeflow.harshithkumar.in" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline font-medium">https://resumeflow.harshithkumar.in</a>.</li>
            <li><strong className="text-slate-800">You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Collecting and Using Your Personal Data</h2>
          <h3 className="text-sm font-semibold text-slate-700">Types of Data Collected</h3>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Personal Data</h4>
          <p className="text-slate-600 leading-relaxed">While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number</li>
            <li>Address, State, Province, ZIP/Postal code, City</li>
          </ul>

          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-4">Usage Data</h4>
          <p className="text-slate-600 leading-relaxed">Usage Data is collected automatically when using the Service. Usage Data may include information such as Your Device&apos;s Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
          <p className="text-slate-600 leading-relaxed">When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device&apos;s unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
          <p className="text-slate-600 leading-relaxed">We may also collect information that Your browser sends whenever You visit Our Service or when You access the Service by or through a mobile device.</p>

          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-4">Tracking Technologies and Cookies</h4>
          <p className="text-slate-600 leading-relaxed">We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies We use include beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong className="text-slate-800">Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service.</li>
            <li><strong className="text-slate-800">Web Beacons.</strong> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.</p>
          <p className="text-slate-600 leading-relaxed">Where required by law, we use non-essential cookies (such as analytics, advertising, and remarketing cookies) only with Your consent. You can withdraw or change Your consent at any time using Our cookie preferences tool (if available) or through Your browser/device settings. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.</p>
          <p className="text-slate-600 leading-relaxed font-semibold">We use both Session and Persistent Cookies for the purposes set out below:</p>
          <ul className="list-disc pl-5 space-y-3 text-slate-600">
            <li>
              <strong className="text-slate-800">Necessary / Essential Cookies</strong><br />
              Type: Session Cookies<br />
              Administered by: Us<br />
              Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.
            </li>
            <li>
              <strong className="text-slate-800">Cookies Policy / Notice Acceptance Cookies</strong><br />
              Type: Persistent Cookies<br />
              Administered by: Us<br />
              Purpose: These Cookies identify if users have accepted the use of cookies on the Website.
            </li>
            <li>
              <strong className="text-slate-800">Functionality Cookies</strong><br />
              Type: Persistent Cookies<br />
              Administered by: Us<br />
              Purpose: These Cookies allow Us to remember choices You make when You use the Website, such as remembering your login details or language preference.
            </li>
            <li>
              <strong className="text-slate-800">Google AdSense & Advertising Cookies</strong><br />
              Type: Persistent Cookies<br />
              Administered by: Third-Party Advertising Vendors (Google)<br />
              Purpose: Google, as a third-party vendor, uses cookies to serve ads on Our Website. Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to Our Website and/or other websites on the Internet. You may opt out of personalized advertising by visiting Google Ads Settings (https://adssettings.google.com) or aboutads.info.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Use of Your Personal Data</h2>
          <p className="text-slate-600 leading-relaxed">The Company may use Personal Data for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong className="text-slate-800">To provide and maintain our Service</strong>, including to monitor the usage of our Service.</li>
            <li><strong className="text-slate-800">To manage Your Account:</strong> to manage Your registration as a user of the Service.</li>
            <li><strong className="text-slate-800">For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased.</li>
            <li><strong className="text-slate-800">To contact You:</strong> By email, telephone calls, SMS, or other equivalent forms of electronic communication.</li>
            <li><strong className="text-slate-800">To provide You</strong> with news, special offers, and general information about other goods, services and events which We offer.</li>
            <li><strong className="text-slate-800">To manage Your requests:</strong> To attend and manage Your requests to Us.</li>
            <li><strong className="text-slate-800">For business transfers:</strong> We may use Your Personal Data to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of assets.</li>
            <li><strong className="text-slate-800">For other purposes</strong>: Such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed font-semibold mt-3">We may share Your Personal Data in the following situations:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong className="text-slate-800">With Service Providers:</strong> To monitor and analyze the use of our Service, to contact You.</li>
            <li><strong className="text-slate-800">For business transfers:</strong> In connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition.</li>
            <li><strong className="text-slate-800">With Affiliates:</strong> We will require those affiliates to honor this Privacy Policy.</li>
            <li><strong className="text-slate-800">With business partners:</strong> To offer You certain products, services or promotions.</li>
            <li><strong className="text-slate-800">With other users:</strong> If Our Service offers public areas, when You share Personal Data or otherwise interact in the public areas.</li>
            <li><strong className="text-slate-800">With Your consent</strong>: We may disclose Your Personal Data for any other purpose with Your consent.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Retention of Your Personal Data</h2>
          <p className="text-slate-600 leading-relaxed">The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>
          <p className="text-slate-600 leading-relaxed">Where possible, We apply shorter retention periods and/or reduce identifiability by deleting, aggregating, or anonymizing data. We apply different retention periods to different categories of Personal Data based on the purpose of processing and legal obligations:</p>
          <ul className="list-disc pl-5 space-y-3 text-slate-600">
            <li>
              <strong className="text-slate-800">Account Information</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>User Accounts: retained for the duration of your account relationship plus up to 24 months after account closure.</li>
              </ul>
            </li>
            <li>
              <strong className="text-slate-800">Customer Support Data</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Support tickets and correspondence: up to 24 months from the date of ticket closure.</li>
                <li>Chat transcripts: up to 24 months for quality assurance and staff training purposes.</li>
              </ul>
            </li>
            <li>
              <strong className="text-slate-800">Usage Data</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Website analytics data (cookies, IP addresses, device identifiers): up to 24 months from the date of collection.</li>
                <li>Server logs (IP addresses, access times): up to 24 months for security monitoring and troubleshooting purposes.</li>
              </ul>
            </li>
          </ul>
          <p className="text-slate-600 leading-relaxed">Usage Data is retained in accordance with the retention periods described above, and may be retained longer only where necessary for security, fraud prevention, or legal compliance.</p>
          <p className="text-slate-600 leading-relaxed">We may retain Personal Data beyond the periods stated above for different reasons: legal obligation, legal claims, your explicit request, or technical limitations (data exists in backup systems).</p>
          <p className="text-slate-600 leading-relaxed">When retention periods expire, We securely delete or anonymize Personal Data according to the following procedures: deletion from active systems, residual copies may remain in encrypted backups for a limited period, and in some cases We convert Personal Data into anonymous statistical data that may be retained indefinitely for research and analytics.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Transfer of Your Personal Data</h2>
          <p className="text-slate-600 leading-relaxed">Your information, including Personal Data, is processed at the Company&apos;s operating offices and in any other places where the parties involved in the processing are located. This information may be transferred to and maintained on computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ.</p>
          <p className="text-slate-600 leading-relaxed">Where required by applicable law, We will ensure that international transfers of Your Personal Data are subject to appropriate safeguards. The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Delete Your Personal Data</h2>
          <p className="text-slate-600 leading-relaxed">You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You. Our Service may give You the ability to delete certain information about You from within the Service.</p>
          <p className="text-slate-600 leading-relaxed">You may update, amend, or delete Your information at any time by signing in to Your Account and visiting the account settings section. You may also contact Us to request access to, correct, or delete any Personal Data that You have provided to Us.</p>
          <p className="text-slate-600 leading-relaxed">Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Disclosure of Your Personal Data</h2>
          <h3 className="text-sm font-semibold text-slate-700">Business Transactions</h3>
          <p className="text-slate-600 leading-relaxed">If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
          <h3 className="text-sm font-semibold text-slate-700">Law enforcement</h3>
          <p className="text-slate-600 leading-relaxed">Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities.</p>
          <h3 className="text-sm font-semibold text-slate-700">Other legal requirements</h3>
          <p className="text-slate-600 leading-relaxed">The Company may disclose Your Personal Data in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend the rights or property of the Company, prevent or investigate possible wrongdoing, protect the personal safety of Users, or protect against legal liability.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Security of Your Personal Data</h2>
          <p className="text-slate-600 leading-relaxed">The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Children&apos;s Privacy</h2>
          <p className="text-slate-600 leading-relaxed">Our Service does not address anyone under the age of 16. We do not knowingly collect personally identifiable information from anyone under the age of 16. If We become aware that We have collected Personal Data from anyone under the age of 16 without verification of parental consent, We take steps to remove that information from Our servers.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Links to Other Websites</h2>
          <p className="text-slate-600 leading-relaxed">Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party&apos;s site. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Changes to this Privacy Policy</h2>
          <p className="text-slate-600 leading-relaxed">We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page. We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the &quot;Last updated&quot; date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">If you have any questions about this Privacy Policy, You can contact us by visiting our website: <a href="https://resumeflow.harshithkumar.in" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline font-medium">https://resumeflow.harshithkumar.in</a>.</p>
        </section>
      </div>
    ),
  },
  terms: {
    category: "Legal Agreements",
    title: "Terms of Service",
    subtitle: "The rules and guidelines governing your use of the ResumeFlow platform.",
    icon: <FileText className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-6 text-xs md:text-sm">
        <p className="text-slate-500 italic">Last updated: July 16, 2026</p>
        <p className="text-slate-600 leading-relaxed font-medium">Please read these terms and conditions carefully before using Our Service.</p>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Interpretation and Definitions</h2>
          <h3 className="text-sm font-semibold text-slate-700">Interpretation</h3>
          <p className="text-slate-600 leading-relaxed">The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
          <h3 className="text-sm font-semibold text-slate-700">Definitions</h3>
          <p className="text-slate-600 leading-relaxed">For the purposes of these Terms and Conditions:</p>
          <ul className="list-disc pl-5 space-y-3 text-slate-600">
            <li><strong className="text-slate-800">Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party.</li>
            <li><strong className="text-slate-800">Country</strong> refers to: Telangana, India.</li>
            <li><strong className="text-slate-800">Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot;) refers to Resume Flow.</li>
            <li><strong className="text-slate-800">Device</strong> means any device that can access the Service such as a computer, a cell phone or a digital tablet.</li>
            <li><strong className="text-slate-800">Service</strong> refers to the Website.</li>
            <li><strong className="text-slate-800">Terms and Conditions</strong> (also referred to as &quot;Terms&quot;) means these Terms and Conditions, including any documents expressly incorporated by reference.</li>
            <li><strong className="text-slate-800">Third-Party Social Media Service</strong> means any services or content provided by a third party that is displayed, included, made available, or linked to through the Service.</li>
            <li><strong className="text-slate-800">Website</strong> refers to Resume Flow, accessible from <a href="https://resumeflow.harshithkumar.in" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline font-medium">https://resumeflow.harshithkumar.in</a>.</li>
            <li><strong className="text-slate-800">You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Acknowledgment</h2>
          <p className="text-slate-600 leading-relaxed">These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
          <p className="text-slate-600 leading-relaxed">By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service. You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>
          <p className="text-slate-600 leading-relaxed">Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Links to Other Websites</h2>
          <p className="text-slate-600 leading-relaxed">Our Service may contain links to third-party websites or services that are not owned or controlled by the Company. The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services.</p>
          <p className="text-slate-600 leading-relaxed">The Service may also display, include, make available, or link to content or services provided by a Third-Party Social Media Service. A Third-Party Social Media Service is not owned or controlled by the Company, and the Company does not endorse or assume responsibility for any Third-Party Social Media Service.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Termination</h2>
          <p className="text-slate-600 leading-relaxed">We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions. Upon termination, Your right to use the Service will cease immediately.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven&apos;t purchased anything through the Service.</p>
          <p className="text-slate-600 leading-relaxed">To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data, business interruption, personal injury, loss of privacy), even if the Company or any supplier has been advised of the possibility of such damages.</p>
          <p className="text-slate-600 leading-relaxed">Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party&apos;s liability will be limited to the greatest extent permitted by law.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">&quot;AS IS&quot; and &quot;AS AVAILABLE&quot; Disclaimer</h2>
          <p className="text-slate-600 leading-relaxed">The Service is provided to You &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service.</p>
          <p className="text-slate-600 leading-relaxed">Without limiting the foregoing, neither the Company nor any of the company&apos;s provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content; or (iv) that the Service, its servers, or e-mails sent from the Company are free of viruses or other harmful components.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Governing Law</h2>
          <p className="text-slate-600 leading-relaxed">The laws of the Country, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Disputes Resolution</h2>
          <p className="text-slate-600 leading-relaxed">If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">For European Union (EU) Users</h2>
          <p className="text-slate-600 leading-relaxed">If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">United States Legal Compliance</h2>
          <p className="text-slate-600 leading-relaxed">You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated as a &quot;terrorist supporting&quot; country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Severability and Waiver</h2>
          <h3 className="text-sm font-semibold text-slate-700">Severability</h3>
          <p className="text-slate-600 leading-relaxed">If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>
          <h3 className="text-sm font-semibold text-slate-700">Waiver</h3>
          <p className="text-slate-600 leading-relaxed">Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party&apos;s ability to exercise such right or require such performance at any time thereafter.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Translation Interpretation</h2>
          <p className="text-slate-600 leading-relaxed">These Terms and Conditions may have been translated if We have made them available to You on our Service. You agree that the original English text shall prevail in the case of a dispute.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Changes to These Terms and Conditions</h2>
          <p className="text-slate-600 leading-relaxed">We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days&apos; notice prior to any new terms taking effect. By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">If you have any questions about these Terms and Conditions, You can contact us by visiting our website: <a href="https://resumeflow.harshithkumar.in" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline font-medium">https://resumeflow.harshithkumar.in</a>.</p>
        </section>
      </div>
    ),
  },
  cookies: {
    category: "Legal & Settings",
    title: "Cookie Policy & Settings",
    subtitle: "How ResumeFlow uses cookies, local storage, and similar tracking technologies to provide and improve our service.",
    icon: <Cookie className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8 text-xs md:text-sm">
        <p className="text-slate-500 italic">Last updated: July 22, 2026</p>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">1. What Are Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners information about how their site is being used. Local storage is a similar technology that allows websites to store information locally on your browser for persistent data that doesn&apos;t need to be transmitted to the server with every request.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">2. How We Use Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            ResumeFlow uses cookies and local storage for the following purposes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Authentication:</strong> Session cookies verify your login status and maintain your authenticated session across page navigations within our dashboard.</li>
            <li><strong>Security:</strong> We use cookies to detect and prevent fraudulent activity, protect user accounts from unauthorized access, and enforce rate limiting.</li>
            <li><strong>User Preferences:</strong> Local storage remembers your UI layout choices (such as workspace maximization state), template selections, and theme preferences.</li>
            <li><strong>Performance & Analytics:</strong> We use analytics cookies to understand how users interact with our service, identify areas for improvement, and measure feature adoption.</li>
            <li><strong>Advertising:</strong> With your consent, third-party advertising partners (including Google AdSense) may set cookies to serve relevant advertisements based on your browsing activity.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">3. Types of Cookies We Use</h2>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Essential / Strictly Necessary Cookies</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                These cookies are required for the basic functioning of our platform. They enable secure login, database query authentication, and session management. Without these cookies, core features like signing in, accessing the dashboard, and tailoring resumes would not function. These cookies do not require user consent and cannot be disabled through our cookie preference tools.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Functionality Cookies</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                These cookies remember your preferences and choices to provide a personalized experience. This includes remembering your selected resume template, workspace layout preferences, and dismissed notification banners. Information collected by these cookies may be anonymized and does not track your browsing activity on other websites.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Analytics and Performance Cookies</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                We use analytics services (including but not limited to Google Analytics, Sentry, and Vercel Analytics) to collect aggregated data about how visitors use our platform. This includes page views, feature interactions, error rates, and load times. This data helps us improve our service and identify technical issues. These cookies collect anonymized data and do not directly identify individual users.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Advertising and Marketing Cookies (Google AdSense)</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                Our website uses Google AdSense, a service provided by Google LLC (&ldquo;Google&rdquo;), to display advertisements. Google AdSense uses cookies (specifically, the DoubleClick cookie from Google) to serve ads based on your previous visits to our website and other websites across the internet. These cookies enable Google and its partners to serve personalized ads based on your browsing history and interests.
              </p>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                The DoubleClick cookie enables Google to: (a) serve advertisements to users based on their visit to our Website and/or other websites; (b) measure the effectiveness of advertising campaigns; (c) prevent the same ad from appearing too frequently; and (d) report on ad impressions and interactions. You can learn more about how Google uses data when you use our site by visiting <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">Google&apos;s Privacy & Terms site</a>.
              </p>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                <strong>Opt-Out:</strong> You can opt out of personalized advertising by visiting Google&apos;s Ads Settings at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">https://adssettings.google.com</a>. You can also opt out of third-party cookies used for personalized advertising by visiting <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">https://optout.aboutads.info</a> (for US-based users) or <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">https://www.youronlinechoices.com</a> (for EU-based users).
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">4. Third-Party Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            In addition to our own cookies, we may use various third-party services that also set cookies on your device. These third parties include:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Google AdSense & DoubleClick:</strong> Advertising personalization and measurement cookies as described above.</li>
            <li><strong>Google Analytics:</strong> Aggregated usage analytics and behavior tracking.</li>
            <li><strong>Sentry:</strong> Error tracking and performance monitoring (may set functional cookies for session correlation).</li>
            <li><strong>Convex (Database Provider):</strong> Authentication session verification (essential cookies).</li>
            <li><strong>Clerk (Authentication Provider):</strong> Session and authentication cookies for user sign-in.</li>
            <li><strong>Vercel (Hosting Provider):</strong> Analytics and deployment monitoring.</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">
            These third-party services have their own privacy policies governing the use of your data. We encourage you to review their policies for complete information about their data processing practices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">5. Cookie Consent and Your Choices</h2>
          <p className="text-slate-600 leading-relaxed">
            When you first visit ResumeFlow, we display a cookie consent banner that allows you to choose which categories of cookies you accept. You can:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Accept all cookies (essential, functional, analytics, and advertising).</li>
            <li>Accept only essential and functional cookies (reject analytics and advertising).</li>
            <li>Reject all non-essential cookies (continue with essential cookies only).</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">
            You can change your cookie preferences at any time by clicking the &ldquo;Cookie Settings&rdquo; link in the footer of our website. You can also control cookies through your browser settings. Most web browsers allow you to manage your cookie preferences through their settings menus. Please consult your browser&apos;s help documentation for specific instructions.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Please note that blocking or deleting essential cookies may impact your ability to use certain features of our platform, including signing in and accessing your dashboard.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">6. Updates to This Policy</h2>
          <p className="text-slate-600 leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. When we make material changes, we will notify you by updating the &ldquo;Last updated&rdquo; date at the top of this policy and, where appropriate, through a prominent notice on our website or via email. We encourage you to review this page periodically for the latest information about our cookie practices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">7. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            If you have any questions about this Cookie Policy or our use of cookies and tracking technologies, please contact us at <a href="mailto:support@resumeflow.harshithkumar.in" className="text-rose-600 hover:underline font-semibold">support@resumeflow.harshithkumar.in</a> or visit our <a href="/info/contact" className="text-rose-600 hover:underline font-semibold">Contact Us</a> page.
          </p>
        </section>
      </div>
    ),
  },
  contact: {
    category: "Support & Inquiries",
    title: "Contact Support",
    subtitle: "Get in touch with the ResumeFlow team for help, privacy requests, or business partnerships.",
    icon: <FileText className="w-8 h-8 text-rose-600" />,
    body: (
      <div className="space-y-8 text-xs md:text-sm">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Official Contact Details</h2>
          <p className="text-slate-600 leading-relaxed">
            Have questions about your account, subscription credits, or Privacy Policy data rights? Our customer support team is available Monday through Friday to assist you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Customer Support & Inquiries</h3>
              <p className="text-slate-600">Email: <a href="mailto:support@resumeflow.harshithkumar.in" className="text-rose-600 hover:underline font-semibold">support@resumeflow.harshithkumar.in</a></p>
              <p className="text-slate-500 text-[11px]">Response Time: Within 24 business hours</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <h3 className="font-bold text-slate-800 text-sm">Operating Office & Region</h3>
              <p className="text-slate-600">Company: ResumeFlow Engineering</p>
              <p className="text-slate-500 text-[11px]">Location: Telangana, India</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-800">Data & Privacy Requests</h2>
          <p className="text-slate-600 leading-relaxed">
            For personal data deletion, GDPR/DPDP data export requests, or security disclosures, please send your email with the subject line <strong>&quot;Privacy Data Request&quot;</strong> to our support address above.
          </p>
        </section>
      </div>
    ),
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = titleMeta[slug] || "Legal — ResumeFlow";
  const description =
    descriptionMeta[slug] ||
    "Legal documentation for ResumeFlow AI resume builder platform.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/legal/${slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/legal/${slug}`,
    },
  };
}

export default async function LegalSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pageData = legalContent[slug];

  if (!pageData) {
    notFound();
  }

  return (
    <StaticPageWrapper
      category={pageData.category}
      title={pageData.title}
      subtitle={pageData.subtitle}
    >
      <div className="flex gap-4 items-center mb-6">
        {pageData.icon}
        <div className="h-px bg-slate-200/60 flex-1" />
      </div>
      {pageData.body}
    </StaticPageWrapper>
  );
}
