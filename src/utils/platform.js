import { SiPlaystation, SiSteam } from "react-icons/si";
import { BsNintendoSwitch } from "react-icons/bs";
import { FaDesktop, FaMobileScreen, FaGamepad } from "react-icons/fa6";

export const PLATFORM = {
  Switch: { icon: BsNintendoSwitch, className: "bg-[#E60012] text-white" },
  PS5: { icon: SiPlaystation, className: "bg-[#006FCD] text-white" },
  PS4: { icon: SiPlaystation, className: "bg-[#006FCD] text-white" },
  Steam: { icon: SiSteam, className: "bg-[#171a21] text-white" },
  PC: { icon: FaDesktop, className: "bg-slate-600 text-white" },
  スマホ: { icon: FaMobileScreen, className: "bg-emerald-600 text-white" },
  その他: { icon: FaGamepad, className: "bg-amber-600 text-white" },
};
