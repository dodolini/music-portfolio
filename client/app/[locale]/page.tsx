import MainSection from "../components/sections/mainSection";
import BitLibrary from "../components/sections/bit-library/BitLibrary";
import {BeatLibraryProvider} from "../context/beatsContext";
import ContactSection from "../components/sections/contact/contactSection";
import FooterSection from "../components/sections/footer/footerSection";
import SideFixMenu from "../components/sideFixMenu";
import { getBeats } from "../../lib/beats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialBeats = await getBeats();

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
