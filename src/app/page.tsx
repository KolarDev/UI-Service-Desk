import ServiceDeskHome from '@/components/ServiceDeskHome';
import { getUnits } from '@/lib/db';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "University of Ibadan Network Service Desk | UI ICT Unit",
  description: "Official University of Ibadan (ui.edu.ng) IT Network Service Desk. Submit network complaints, email access issues, LAN Routing requests, and report core backbone fiber switch problems anonymously.",
  keywords: ["University of Ibadan", "UI", "Network Service Desk", "ICT", "Helpdesk", "NOC", "Fiber Network"],
  openGraph: {
    title: "University of Ibadan Network Service Desk",
    description: "Submit network complaints, email access issues, LAN Routing requests, and report core backbone fiber switch problems anonymously.",
    type: "website",
  }
};

export default function Home() {
  const units = getUnits();
  return <ServiceDeskHome initialUnits={units} />;
}