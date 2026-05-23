import MainSection from "../components/sections/mainSection";
import BitLibrary from "../components/sections/bit-library/BitLibrary";
import {BeatLibraryProvider} from "../context/beatsContext";
import ContactSection from "../components/sections/contact/contactSection";
import FooterSection from "../components/sections/footer/footerSection";
import SideFixMenu from "../components/sideFixMenu";

async function getInitialBeats() {
  const res = await fetch(`${process.env.BACKEND_URL}/beats/list`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch beats');
  }

  return res.json();
}

export default async function Home() {
  const initialBeats = await getInitialBeats();

  return (
      <BeatLibraryProvider>
        <div className="font-sans bg-white">
          <MainSection initialBeats={initialBeats}/>
          <BitLibrary initialBeats={initialBeats}/>
          <ContactSection/>
          <FooterSection/>
          <SideFixMenu/>
        </div>
      </BeatLibraryProvider>
  );
}
