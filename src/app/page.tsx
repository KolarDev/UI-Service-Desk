import ServiceDeskHome from '@/components/ServiceDeskHome';
import { getUnitsAction } from '@/app/actions';
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

export default async function Home() {
  const units = await getUnitsAction();
  return <ServiceDeskHome initialUnits={units} />;
}