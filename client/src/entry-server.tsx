import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import React from "react";

import HandymanLanding from "./pages/HandymanLanding";
import HouseCleaningLanding from "./pages/HouseCleaningLanding";
import LawnCareLanding from "./pages/LawnCareLanding";
import SnowRemovalLanding from "./pages/SnowRemovalLanding";
import DogWalkingLanding from "./pages/DogWalkingLanding";
import TutoringLanding from "./pages/TutoringLanding";
import HVACLanding from "./pages/HVACLanding";
import PlumbingLanding from "./pages/PlumbingLanding";
import ElectricalLanding from "./pages/ElectricalLanding";
import CarpetCleaningLanding from "./pages/CarpetCleaningLanding";
import PressureWashingLanding from "./pages/PressureWashingLanding";
import WindowCleaningLanding from "./pages/WindowCleaningLanding";
import BarberLanding from "./pages/BarberLanding";
import SpaLanding from "./pages/SpaLanding";
import NailSalonLanding from "./pages/NailSalonLanding";
import TattooLanding from "./pages/TattooLanding";
import WalkInLanding from "./pages/WalkInLanding";
import HairSalonLanding from "./pages/HairSalonLanding";
import PetGroomerLanding from "./pages/PetGroomerLanding";
import EstheticianLanding from "./pages/EstheticianLanding";
import RideServiceLanding from "./pages/RideServiceLanding";
import IndustriesHub from "./pages/IndustriesHub";

const ROUTE_MAP: Record<string, React.ComponentType> = {
  "/industries":       IndustriesHub,
  "/handyman":         HandymanLanding,
  "/house-cleaning":   HouseCleaningLanding,
  "/lawn-care":        LawnCareLanding,
  "/snow-removal":     SnowRemovalLanding,
  "/dog-walking":      DogWalkingLanding,
  "/tutoring":         TutoringLanding,
  "/hvac":             HVACLanding,
  "/plumbing":         PlumbingLanding,
  "/electrical":       ElectricalLanding,
  "/carpet-cleaning":  CarpetCleaningLanding,
  "/pressure-washing": PressureWashingLanding,
  "/window-cleaning":  WindowCleaningLanding,
  "/barbers":          BarberLanding,
  "/spa":              SpaLanding,
  "/nails":            NailSalonLanding,
  "/tattoo":           TattooLanding,
  "/haircuts":         WalkInLanding,
  "/hair-salons":      HairSalonLanding,
  "/groomers":         PetGroomerLanding,
  "/estheticians":     EstheticianLanding,
  "/ride-service":     RideServiceLanding,
};

export function render(url: string): { html: string } {
  const urlPath = url.split("?")[0];
  const Page = ROUTE_MAP[urlPath];
  if (!Page) return { html: "" };

  const html = renderToString(
    <MemoryRouter initialEntries={[urlPath]}>
      <Page />
    </MemoryRouter>
  );

  return { html };
}
