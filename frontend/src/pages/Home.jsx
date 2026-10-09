import HeroSection from '../components/landing/HeroSection.jsx';
import ProblemSection from '../components/landing/ProblemSection.jsx';
import FeaturesSection from '../components/landing/FeaturesSection.jsx';
import AcademicsSection from '../components/landing/AcademicsSection.jsx';
import CommunitySection from '../components/landing/CommunitySection.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import DashboardPreview from '../components/landing/DashboardPreview.jsx';
import WhyCampusConnect from '../components/landing/WhyCampusConnect.jsx';
import CTASection from '../components/landing/CTASection.jsx';

function Home() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <AcademicsSection />
      <CommunitySection />
      <HowItWorks />
      <DashboardPreview />
      <WhyCampusConnect />
      <CTASection />
    </>
  );
}

export default Home;
