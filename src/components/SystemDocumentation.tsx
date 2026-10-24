import React from 'react';
import { useSystem } from '../context/SystemContext.tsx';
import { 
  Printer, 
  FileText, 
  Shield, 
  CheckCircle, 
  Award, 
  Target, 
  Eye, 
  Compass, 
  Cpu, 
  Users, 
  HardDrive, 
  AlertTriangle, 
  Bookmark, 
  ArrowLeft 
} from 'lucide-react';

interface SystemDocumentationProps {
  onBack?: () => void;
}

export const SystemDocumentation: React.FC<SystemDocumentationProps> = ({ onBack }) => {
  const { branding } = useSystem();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Action Bar (Hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> ተመለስ
            </button>
          )}
          <div>
            <h2 className="text-lg font-black text-white font-serif">
              የሲስተም አጠቃላይ ሰነድ እና ማኑዋል (Official System Document)
            </h2>
            <p className="text-xs text-slate-400">
              የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የጦር መሳሪያ ምዝገባ ሲስተም የተሟላ ሰነድ
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Printer className="h-4 w-4" />
          <span>ሰነዱን አትም / በPDF አስቀምጥ (Print / Export PDF)</span>
        </button>
      </div>

      {/* Main Printable Document Body */}
      <article className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 text-slate-900 shadow-2xl print:m-0 print:border-none print:p-4 print:shadow-none font-sans leading-relaxed">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-8 text-center">
          <div className="flex flex-col items-center">
            <div className="h-16 w-24 overflow-hidden rounded border border-slate-300">
              <img src={branding.bgrsFlag} alt="BGRS Flag" className="h-full w-full object-cover" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-1">የቤ/ጉ/ክ/መንግስት</span>
          </div>

          <div className="flex flex-col items-center px-4">
            <div className="h-20 w-20 mb-2">
              <img src={branding.policeLogo} alt="Police Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-base sm:text-xl font-black text-slate-950 font-serif leading-tight">
              {branding.commissionNameAm}
            </h1>
            <h2 className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5">
              {branding.processNameAm}
            </h2>
            <p className="text-[11px] font-semibold text-slate-600 mt-1">
              የጦር መሳሪያ ምዝገባ፣ ቁጥጥር እና ዲጂታል ፈቃድ አሰጣጥ ዋና ክፍል
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-16 w-24 overflow-hidden rounded border border-slate-300">
              <img src={branding.ethiopiaFlag} alt="Ethiopia Flag" className="h-full w-full object-cover" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-1">የኢ.ፌ.ዴ.ሪ ሰንደቅ</span>
          </div>
        </div>

        {/* Title Banner */}
        <div className="mb-8 rounded-2xl bg-slate-100 p-6 text-center border border-slate-300">
          <span className="text-[11px] font-black uppercase tracking-widest text-blue-900 block mb-1">
            ኦፊሴላዊ የፕሮጀክት እና የቴክኒክ ሰነድ (Official System & Project Document)
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-serif leading-snug">
            የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የጦር መሳሪያ ምዝገባ፣ ቁጥጥር እና ዲጂታል ፈቃድ ማረጋገጫ ሲስተም
          </h2>
          <p className="text-xs font-bold text-slate-700 mt-2">
            Benishangul Gumuz Regional Police Commission Firearms Registration, Control & Digital Verification System
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 border-t border-slate-200 pt-3">
            <span><b>የተዘጋጀው፦</b> በኮሚሽኑ ቴክኖሎጂ ማስፋፊያና መረጃ ማዕከል</span>
            <span>•</span>
            <span><b>ስሪት፦</b> 2.0 (High Security Cloud Edition)</span>
            <span>•</span>
            <span><b>ቦታ፦</b> አሶሳ፣ ቤኒሻንጉል ጉሙዝ፣ ኢትዮጵያ</span>
          </div>
        </div>

        {/* SECTION 1: ርዕስ */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <Bookmark className="h-5 w-5 text-amber-700" />
            1. የሲስተሙ ይፋዊ ርዕስ (System Title)
          </h3>
          <p className="text-sm text-slate-800 leading-relaxed pl-7">
            <b>«በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የወንጀል መከላከል የስራ ሂደት የጦር መሳሪያ ምዝገባ፣ ዲጂታል መታወቂያ፣ ሰርቲፊኬት እና ፈጣን ማረጋገጫ ሲስተም (BGRS Police Commission Firearms Registration & Verification System)»</b>
          </p>
        </section>

        {/* SECTION 2: መግቢያ */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <Compass className="h-5 w-5 text-blue-800" />
            2. መግቢያ (Introduction)
          </h3>
          <div className="text-xs sm:text-sm text-slate-800 space-y-3 pl-7">
            <p>
              የጦር መሳሪያ ቁጥጥር እና አስተዳደር የአንድን ሃገር እና ክልል የህዝብ ሰላምና ደህንነት፣ የህግ የበላይነት እንዲሁም የወንጀል መከላከል ስራዎችን ውጤታማ ለማድረግ ወሳኝ መሰረት ነው። የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የወንጀል መከላከል የስራ ሂደት በክልሉ ውስጥ የሚገኙ የግል እና የመንግስት የጦር መሳሪያዎችን በአግባቡ የመመዝገብ፣ ፍቃድ የመስጠት፣ የመቆጣጠር እና ህገ-ወጥ የጦር መሳሪያ ዝውውርን የመከላከል ህጋዊ ሃላፊነት ተጥሎበታል።
            </p>
            <p>
              ይህንን ሃላፊነት በዘመናዊ የኢንፎርሜሽን ቴክኖሎጂ በመደገፍ ቀደም ሲል የነበረውን አድካሚና ለስህተት የተጋለጠ የወረቀት አሰራር በመቀየር፤ ይፋዊ፣ ደህንነቱ የተጠበቀ፣ በክላውድ (Cloud Database) ላይ የተደራጀ እና በዲጂታል የደህንነት ኪው-አር ኮድ (Encrypted QR Code) የተደገፈ የጦር መሳሪያ ምዝገባ፣ የአይሲቲ ኤቲኤም-ሳይዝ መታወቂያ ካርድ (ATM-size Smart ID) እና የA4 ሰርቲፊኬት ማመንጫ ሲስተም ተዘጋጅቶ ስራ ላይ ውሏል።
            </p>
          </div>
        </section>

        {/* SECTION 3: ራዕይ */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <Eye className="h-5 w-5 text-emerald-700" />
            3. የሲስተሙ ራዕይ (Vision)
          </h3>
          <div className="text-xs sm:text-sm text-slate-800 pl-7">
            <blockquote className="rounded-xl border-l-4 border-emerald-600 bg-emerald-50/70 p-4 font-semibold text-emerald-950 italic">
              «በቤኒሻንጉል ጉሙዝ ክልል ውስጥ የሚገኝ እያንዳንዱ የጦር መሳሪያ ሙሉ በሙሉ በዲጂታል መረጃ ቋት ተመዝግቦ፣ ቁጥጥር ተደርጎበት እና በፈጣን የደህንነት ማረጋገጫ ተደግፎ የክልሉን ማህበረሰብ ሰላምና ጸጥታ በዘላቂነት ማረጋገጥ።»
            </blockquote>
          </div>
        </section>

        {/* SECTION 4: አላማ */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-amber-700" />
            4. የሲስተሙ አላማ (Objective)
          </h3>
          <div className="text-xs sm:text-sm text-slate-800 space-y-2 pl-7">
            <p>
              የዚህ ሲስተም ዋና አላማ በክልሉ ፖሊስ ኮሚሽን የሚካሄደውን የጦር መሳሪያ ምዝገባ፣ የእድሳት፣ የፈቃድ አሰጣጥ፣ የመሳሪያ ገቢና ቅያሪ ሂደቶችን ከወረቀት አሰራር ወደ 100% ዲጂታልና የተማከለ የክላውድ ሲስተም በማሸጋገር፤ ህገ-ወጥ ዝውውርን፣ ማጭበርበርን እና የሰነድ ቅጅን ሙሉ በሙሉ ማስቀረት ነው።
            </p>
          </div>
        </section>

        {/* SECTION 5: ግብ */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-indigo-700" />
            5. የሲስተሙ ዝርዝር ግቦች (Specific Goals)
          </h3>
          <ul className="list-disc pl-12 text-xs sm:text-sm text-slate-800 space-y-2">
            <li>በክልሉ ውስጥ ያሉትን ሁሉንም ህጋዊ የጦር መሳሪያዎች በአንድ የተማከለ ዳታቤዝ ውስጥ መመዝገብ፤</li>
            <li>የአንድን መሳሪያ ንምራ ቁጥር (Serial Number) በመጠቀም የሚደረግን የተጭበረበረ ድጋሚ ምዝገባ በሲስተሙ አማካኝነት በራስ-ሰር ማክሸፍ፤</li>
            <li>እያንዳንዱ ባለመሳሪያ በኪስ የሚያዝ የፕላስቲክ ኤቲኤም መታወቂያ ካርድ እና ይፋዊ የA4 ምስክር ወረቀት እንዲኖረው ማድረግ፤</li>
            <li>የፍተሻ ኬላዎች እና የመስክ የፖሊስ አባላት በስማርት ስልካቸው ኪው-አር ኮዱን በመቃኘት ፈቃዱ እውነተኛ ወይም የተጭበረበረ መሆኑን በሰከንዶች ውስጥ እንዲያረጋግጡ ማድረግ፤</li>
            <li>የጦር መሳሪያዎች ገቢ ሲደረጉ፣ ሲቀየሩ፣ ጥይት ሲጨመር ወይም ሲታገዱ ታሪካቸው (Lifecycle Audit Trail) ሳይጠፋ እንዲቀመጥ ማድረግ፤</li>
            <li>በከፍተኛ ክሪፕቶግራፊክ የይለፍ ቃል ምስጠራና ፀረ-ጠላፊ (Anti-Hack) አሰራር የመረጃዎችን ደህንነት ማረጋገጥ።</li>
          </ul>
        </section>

        {/* SECTION 6: መነሻ ሃሳብ እና ቀደም ሲል የነበሩ ችግሮች */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-rose-700" />
            6. ሲስተሙን ለመስራት መነሻ ሃሳብ እና ቀደም ሲል የነበሩ ዋና ዋና ችግሮች (Background & Past Challenges)
          </h3>
          <div className="text-xs sm:text-sm text-slate-800 space-y-3 pl-7">
            <p>
              ቀደም ሲል በኮሚሽኑ ሲተገበር የነበረው ባህላዊ እና የወረቀት ላይ መዝገብ በርካታ ውስብስብ ችግሮች ነበሩበት፦
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5">
                <span className="font-bold text-rose-900 block mb-1">1. የማጭበርበር እና የተደራራቢ ምዝገባ ክፍተት</span>
                <p className="text-xs text-rose-950">
                  አንድ የጦር መሳሪያ በአንድ ወረዳ ተመዝግቦ እያለ በሌላ ሰው ስም ወይም በሌላ ዞን በተመሳሳይ ንምራ ቁጥር (Serial No) ድጋሚ ፈቃድ እንዲወጣለት የማታለል ሙከራዎች ሲደረጉ በወረቀት መዝገብ በቀላሉ ለማወቅ አይቻልም ነበር።
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5">
                <span className="font-bold text-rose-900 block mb-1">2. የሰነድ መጥፋት፣ መበላሸት እና የእሳት አደጋ ስጋት</span>
                <p className="text-xs text-rose-950">
                  የወረቀት መዛግብት በጊዜ ብዛት ይበላሻሉ፣ በውሃ ወይም በእሳት አደጋ ሊወድሙ ይችላሉ፤ እንዲሁም የተመዘገበ ሰነድን ፈልጎ ለማግኘት ቀናትንና ሳምንታትን ይፈጅ ነበር።
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5">
                <span className="font-bold text-rose-900 block mb-1">3. በመስክ እና በፍተሻ ኬላዎች የማረጋገጫ እጦት</span>
                <p className="text-xs text-rose-950">
                  ፖሊስ በመንገድ ላይ ወይም በፍተሻ ኬላ የተያዘን መሳሪያ ፈቃድ ትክክለኛነት ለማረጋገጥ የሚችልበት ዲጂታል መንገድ ባለመኖሩ የፎቶ ኮፒ ሰነድ በመያዝ ማጭበርበር ይፈጸም ነበር።
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5">
                <span className="font-bold text-rose-900 block mb-1">4. የመሳሪያ ታሪክ እና ክትትል ክፍተት</span>
                <p className="text-xs text-rose-950">
                  መሳሪያው በግምጃ ቤት ገቢ ሲደረግ፣ ጥይት ሲጨመርበት ወይም ሌላ መሳሪያ ሲቀየር የተደረጉት ለውጦች በግልጽ ተመዝግበው ሳይቀመጡ ሰነዱ ተበታትኖ ይቀራል።
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: ይህ ሲስተም የሚቀርፈው ችግር */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-emerald-700" />
            7. ይህ ሲስተም የሚቀርፋቸው ችግሮች (Problems Solved by this System)
          </h3>
          <ul className="list-disc pl-12 text-xs sm:text-sm text-slate-800 space-y-2">
            <li><b>የተደራራቢ ንምራ ቁጥር ማጭበርበርን 100% አስቀርቷል፦</b> አንድ የጦር መሳሪያ ንምራ ቁጥር በሲስተሙ ከተመዘገበ በኋላ፣ መሳሪያው በህጋዊ መንገድ በፖሊስ ግምጃ ቤት ገቢ እስካልተደረገ ድረስ ማንም ሰው ድጋሚ በሌላ ስም እንዳይመዘግብ ሲስተሙ ወዲያውኑ አግዶ የቀድሞውን ባለቤት ሙሉ ፋይል ያወጣል።</li>
            <li><b>የተጭበረበረ ሰነድ ይዞ መንቀሳቀስን አስቀርቷል፦</b> እያንዳንዱ መታወቂያ እና ሰርቲፊኬት ላይ የተቀመጠውን ኪው-አር ኮድ በስልክ ስካን በማድረግ የመሳሪያው፣ የባለቤቱና የፈቃዱ ትክክለኛነት በሰከንዶች ውስጥ ይረጋገጣል።</li>
            <li><b>የመረጃ መጥፋትን አስቀርቷል፦</b> ሁሉም መረጃዎች፣ ሎጎዎች፣ ፊርማዎችና ማህተሞች በGoogle Firebase Firestore ክላውድ ዳታቤዝ ላይ በቋሚነት ስለሚቀመጡ በኮምፒውተር መበላሸትም ሆነ በሌላ አደጋ አይጠፉም።</li>
            <li><b>የስራ መጓተትን አስቀርቷል፦</b> በሰከንዶች ውስጥ ፈልጎ ማግኘት (Instant Search)፣ በዞንና በወረዳ መለየት፣ እና በአንድ ጠቅታ ህጋዊ የካርድና የሰርቲፊኬት ህትመት ማከናወን አስችሏል።</li>
          </ul>
        </section>

        {/* SECTION 8: ጥቅሙ */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-blue-800" />
            8. የሲስተሙ ዋና ዋና ጥቅሞች (Benefits & Value)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-800 pl-7">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <span className="font-bold text-slate-950 block mb-1">ለፖሊስ ኮሚሽኑ አመራር፦</span>
              <p className="text-xs text-slate-700">
                በክልሉ ያሉትን አጠቃላይ የተመዘገቡ፣ የጸደቁ፣ የታገዱ እና ገቢ የተደረጉ መሳሪያዎች ብዛት በዳሽቦርድ በግራፍና በቁጥር በቀጥታ ማወቅ እና ስትራቴጂካዊ ውሳኔ መስጠት ያስችላል።
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <span className="font-bold text-slate-950 block mb-1">ለመስክና የኬላ ፖሊስ አባላት፦</span>
              <p className="text-xs text-slate-700">
                ያለ ምንም ውስብስብ ሶፍትዌር በማንኛውም ስማርት ስልክ ካሜራ ኪው-አር ኮዱን በመቃኘት የፈቃዱን ህጋዊነት፣ የአገልግሎት ጊዜውን እና የባለቤቱን ፎቶ በቅጽበት ማረጋገጥ ይችላሉ።
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <span className="font-bold text-slate-950 block mb-1">ለባለመሳሪያው ማህበረሰብ፦</span>
              <p className="text-xs text-slate-700">
                በኪስ የሚያዝ ዘመናዊና የተከበረ የፕላስቲክ ኤቲኤም መታወቂያ ካርድ እና ይፋዊ የA4 ምስክር ወረቀት በማግኘት ሰላማዊ እንቅስቃሴውን ያረጋግጣል።
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <span className="font-bold text-slate-950 block mb-1">ለክልሉ ዘላቂ ሰላምና ጸጥታ፦</span>
              <p className="text-xs text-slate-700">
                የመሳሪያዎች ዝውውር ጥብቅ ቁጥጥር ስለሚደረግበት ህገ-ወጥ ዝውውርንና ወንጀልን አስቀድሞ ለመከላከል ከፍተኛ አስተዋጽኦ ያበረክታል።
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 9: አሰራሩ */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <Cpu className="h-5 w-5 text-purple-700" />
            9. የሲስተሙ አሰራር እና ቴክኒካዊ መዋቅር (System Architecture & Operational Workflow)
          </h3>
          <div className="text-xs sm:text-sm text-slate-800 space-y-3 pl-7">
            <p>
              ሲስተሙ የተገነባው እጅግ ዘመናዊ፣ ፈጣን እና ደህንነቱ በተረጋገጠ የዌብ ቴክኖሎጂ (React, TypeScript, Tailwind CSS, Google Firestore Cloud DB, IndexedDB Offline-First Caching) ነው፦
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">1</span>
                <div>
                  <b>የምዝገባ ሂደት (Registration Stage)፦</b> መዝጋቢው ኦፊሰር የባለመሳሪያውን ሙሉ ስም፣ ስልክ ቁጥር፣ አድራሻ፣ ብሔራዊ መታወቂያ፣ እንዲሁም የመሳሪያውን ዝርዝር (አይነት፣ ንምራ ቁጥር፣ የጥይትና ካርታ ብዛት) ይመዘግባል። ፎቶውን በቀጥታ በፎቶ ስቱዲዮ አስተካክሎ ያካትታል።
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">2</span>
                <div>
                  <b>የተደራራቢ ንምራ ፍተሻ (Automatic Serial Duplication Check)፦</b> ሲስተሙ ወዲያውኑ ንምራ ቁጥሩን ከዳታቤዝ ጋር ያመሳክራል። ከዚህ ቀደም የተመዘገበ ከሆነና ገቢ ካልተደረገ ምዝገባው ይታገዳል፤ የቀደመው ባለቤት ፋይል በሙሉ ይታያል።
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">3</span>
                <div>
                  <b>የማጽደቅ ሂደት (Official Approval Stage)፦</b> የተመዘገበው ሰነድ በቀጥታ ወደ የስራ ሂደት ሃላፊው የማጽደቂያ መድረክ (Approvals Queue) ይላካል። ሃላፊው መርምሮ ካላጸደቀው በስተቀር የህትመትና የፍተሻ አገልግሎት አይሰጥም።
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">4</span>
                <div>
                  <b>የሰነዶች አዘገጃጀትና ህትመት (Card & Certificate Generation)፦</b> ሲጸድቅ ወዲያውኑ ተከታታይ የመታወቂያ ቁጥር (ምሳሌ፡ ቤጌፖ-ጦመ-0001) እና የምስክር ወረቀት ቁጥር ይሰጠዋል። ፊትና ጀርባ ያለው የኤቲኤም ካርድ እና የA4 ሰርቲፊኬት በይፋዊ ማህተምና ፊርማ ታትሞ ይሰጣል።
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">5</span>
                <div>
                  <b>የህይወት ዑደት ክትትል (Weapon Lifecycle Operations)፦</b> መሳሪያ ሲቀየር፣ ገቢ ሲደረግ ወይም ጥይት ሲጨመር በድሮው መታወቂያ ቁጥር ስር ታሪኩ ተመዝግቦ ይቀመጣል። ገቢ የተደረገ መሳሪያም እንደገና በህጋዊ ውሳኔ ሊወጣ ይችላል።
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: አጠቃቀሙ */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-emerald-800" />
            10. የሲስተሙ አጠቃቀም መመሪያ (How to Use the System)
          </h3>
          <div className="text-xs sm:text-sm text-slate-800 space-y-3 pl-7">
            <p><b>ደረጃ 1 - ወደ ሲስተሙ መግባት (Login)፦</b></p>
            <p className="text-xs text-slate-700 pl-4">
              ዋናው አድሚን በራሱ መለያ፤ የስራ ሂደት ሃላፊው ደግሞ በራሱ ይፋዊ መለያ ገብተው ስራቸውን ይሰራሉ። ተከታታይ የተሳሳተ ሙከራ እንዳይደረግ ሲስተሙ ራስ-ሰር መቆለፊያ አለው።
            </p>

            <p><b>ደረጃ 2 - አዲስ መሳሪያ መመዝገብ (+ አዲስ ምዝገባ)፦</b></p>
            <p className="text-xs text-slate-700 pl-4">
              የባለመሳሪያውን 10 ነጥቦች (ስም፣ ስልክ፣ አድራሻ፣ የመሳሪያ ዝርዝር) በመሙላት፤ ፎቶውን ከኮምፒውተር በመጫን ወይም በፎቶ ስቱዲዮ በማስተካከል፣ የባለመሳሪያውን ፊርማ በማስገባት «መዝግብ» የሚለውን መጫን።
            </p>

            <p><b>ደረጃ 3 - በሃላፊው ማጽደቅ (Official Approvals)፦</b></p>
            <p className="text-xs text-slate-700 pl-4">
              የስራ ሂደት ሃላፊው ወደ «የማጽደቂያ መድረክ» ገብቶ ሰነዱን ከመረመረ በኋላ «አጽድቅ (Approve)» የሚለውን ይጫናል። አስፈላጊ ሆኖ ሲገኝ ውድቅ ወይም እገዳ ማድረግ ይችላል።
            </p>

            <p><b>ደረጃ 4 - ካርድና ሰርቲፊኬት ማተም (Print ID & Certificate)፦</b></p>
            <p className="text-xs text-slate-700 pl-4">
              «የተመዘገቡ ማህደሮች» ውስጥ በመግባት የጸደቀውን ሰነድ መክፈት፤ «የኤቲኤም መታወቂያ ካርድ አትም» ወይም «የA4 ሰርቲፊኬት አትም» የሚለውን በመጫን በፕላስቲክ ካርድ ወይም በA4 ወረቀት ጥራት ባለው ፕሪንተር ማተም።
            </p>

            <p><b>ደረጃ 5 - በመስክ ማረጋገጥ (Scan QR Code)፦</b></p>
            <p className="text-xs text-slate-700 pl-4">
              በማንኛውም ስማርት ስልክ ካሜራ ካርዱ ላይ ያለውን ኪው-አር ኮድ ስካን ማድረግ፤ ወዲያውኑ ይፋዊ የማረጋገጫ ገጽ ተከፍቶ መሳሪያው ህጋዊ መሆኑንና ዝርዝሩን ያሳያል።
            </p>
          </div>
        </section>

        {/* SECTION 11: የሚያስፈልገው ሰው */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-700" />
            11. ሲስተሙን ለማስኬድ የሚያስፈልገው የሰው ኃይል (Human Resource Requirements)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-800 pl-7">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="font-bold text-slate-950 block mb-1">1. የስራ ሂደት ሃላፊ (Approving Official)</span>
              <p className="text-xs text-slate-600">
                የቀረቡ የምዝገባ ፋይሎችን የመመርመር፣ ህጋዊነታቸውን የማጽደቅ፣ ውድቅ የማድረግ ወይም የእገዳ ውሳኔዎችን የመስጠት ሙሉ ስልጣን ያለው የፖሊስ አመራር።
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="font-bold text-slate-950 block mb-1">2. ዋና የመረጃ መዝጋቢ ኦፊሰር (Registrar)</span>
              <p className="text-xs text-slate-600">
                የባለመሳሪያውን ሰነዶች የሚቀበል፣ ፎቶ የሚያነሳ ወይም የሚያስተካክል፣ መረጃዎችን በጥንቃቄ ወደ ሲስተሙ የሚያስገባ እና ህትመቶችን የሚያከናውን።
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="font-bold text-slate-950 block mb-1">3. የስርዓት አስተዳዳሪ (System Admin)</span>
              <p className="text-xs text-slate-600">
                የሲስተሙን የይለፍ ቃሎችና የተጠቃሚ ስሞች የሚያስተዳድር፣ የኮሚሽኑን አርማዎችና ማህተሞች የሚያድስ፣ የዳታቤዝ ደህንነትን የሚቆጣጠር የቴክኖሎጂ ባለሙያ።
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 12: የሚያስፈልገው ማቴሪያል */}
        <section className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <HardDrive className="h-5 w-5 text-amber-700" />
            12. የሚያስፈልጉ ቁሳቁሶችና ቴክኖሎጂዎች (Hardware, Software & Material Requirements)
          </h3>
          <div className="text-xs sm:text-sm text-slate-800 space-y-3 pl-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <span className="font-bold text-slate-900 block mb-1">ሃርድዌር (Hardware)፦</span>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                  <li>ዴስክቶፕ ወይም ላፕቶፕ ኮምፒውተር (Core i3 እና ከዚያ በላይ፣ 4GB/8GB RAM)፤</li>
                  <li>የፕላስቲክ ካርድ ፕሪንተር (Plastic PVC Card Printer - ምሳሌ፡ Evolis, Zebra, Fargo) ለኤቲኤም መታወቂያ ካርድ ህትመት፤</li>
                  <li>ቀለም ፕሪንተር (Color Laser/Inkjet Printer) ለA4 ሰርቲፊኬት ህትመት፤</li>
                  <li>ዲጂታል ዌብካም ወይም ስማርት ፎን ለጉርድ ፎቶ ማንሻ፤</li>
                  <li>የፕላስቲክ ካርድ ጥሬ እቃዎች (Blank PVC Cards)።</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <span className="font-bold text-slate-900 block mb-1">ሶፍትዌር እና ኔትወርክ (Software & Network)፦</span>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
                  <li>ማንኛውም መደበኛ የኢንተርኔት ብሮውዘር (Google Chrome, Microsoft Edge, Firefox)፤</li>
                  <li>መሰረታዊ የኢንተርኔት ግንኙነት (የተመዘገቡ መረጃዎች በቀጥታ ወደ Firestore Cloud እንዲመሳሰሉ)፤</li>
                  <li>ኢንተርኔት ለጊዜው ቢቋረጥም እንኳ ሲስተሙ በIndexedDB ከመስመር ውጭ (Offline) መስራት ይችላል።</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 13: ማጠቃለያ */}
        <section className="mb-4">
          <h3 className="text-base font-black text-slate-950 font-serif flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-emerald-800" />
            13. ማጠቃለያ (Conclusion)
          </h3>
          <div className="text-xs sm:text-sm text-slate-800 space-y-3 pl-7">
            <p>
              ይህ የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የወንጀል መከላከል የስራ ሂደት የጦር መሳሪያ ምዝገባ፣ ቁጥጥር እና ዲጂታል ፈቃድ ማረጋገጫ ሲስተም የክልሉን ፖሊስ አሰራር ወደ ላቀ የቴክኖሎጂ ምዕራፍ ያሸጋገረ ፕሮጀክት ነው።
            </p>
            <p>
              ሲስተሙ የተደራራቢ ንምራ ቁጥር ማጭበርበርን በራስ-ሰር የሚያስቀር፣ መሳሪያዎች በግምጃ ቤት ገቢ ሲደረጉና ሲቀየሩ ታሪካቸውን የሚያደራጅ፣ ዘመናዊ የኪስ ኤቲኤም መታወቂያ እና ህጋዊ የA4 ምስክር ወረቀት የሚያመነጭ፣ እንዲሁም በፍተሻ ኬላዎች በሰከንዶች ውስጥ በስልክ ካሜራ ማረጋገጥ የሚያስችል ነው።
            </p>
            <p>
              ከዚህም በተጨማሪ በከፍተኛ ክሪፕቶግራፊክ ምስጠራ (Salted SHA-256) እና ፀረ-ጠላፊ (Anti-Brute Force Lockout) ጥበቃዎች የታነጸ በመሆኑ የመረጃዎች ደህንነት አስተማማኝ ነው። ይህን ሲስተም በሙሉ አቅሙ ስራ ላይ በማዋል የክልላችንን ማህበረሰብ ሰላምና ደህንነት በከፍተኛ ደረጃ መጠበቅ ይቻላል።
            </p>
          </div>
        </section>

        {/* Official Document Footer Stamp & Signatures */}
        <div className="mt-10 border-t-2 border-slate-900 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center text-xs">
            {/* Left: Registrar */}
            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-700">ሰነዱን ያዘጋጀው መዝጋቢ ኦፊሰር፦</span>
              <div className="h-12 w-28 my-1 flex items-center justify-center">
                <img src={branding.defaultRegistrarSignature} alt="Registrar Signature" className="max-h-full max-w-full object-contain" />
              </div>
              <span className="font-extrabold text-slate-950">ኢንስፔክተር አለሙ ከበደ</span>
              <span className="text-[10px] text-slate-500">የቴክኖሎጂ እና መዝጋቢ ኦፊሰር</span>
            </div>

            {/* Center: Official Seal */}
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 my-1">
                <img src={branding.officialStampSeal} alt="Official Stamp" className="h-full w-full object-contain drop-shadow" />
              </div>
              <span className="text-[10px] font-bold text-slate-600">ይፋዊ ማህተም (Official Seal)</span>
            </div>

            {/* Right: Approving Commander */}
            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-700">ያረጋገጠውና ያጸደቀው የስራ ሂደት ሃላፊ፦</span>
              <div className="h-12 w-28 my-1 flex items-center justify-center">
                <img src={branding.defaultApproverSignature} alt="Approver Signature" className="max-h-full max-w-full object-contain" />
              </div>
              <span className="font-extrabold text-slate-950">ኮማንደር መንግስቱ በቀለ</span>
              <span className="text-[10px] text-slate-500">{branding.processNameAm} ሃላፊ</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
