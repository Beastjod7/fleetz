-- Insert sample vehicles with fake license plates for testing
INSERT INTO public.vehicles (make, model, year, license_plate, capacity, status, fuel_type, mileage) VALUES
  ('Toyota', 'Camry', 2022, 'ABC-1234', 5, 'available', 'gasoline', 15000),
  ('Honda', 'Accord', 2023, 'XYZ-5678', 5, 'available', 'hybrid', 8000),
  ('Ford', 'Transit', 2021, 'DEF-9012', 12, 'available', 'diesel', 42000),
  ('Tesla', 'Model 3', 2023, 'ELX-3456', 5, 'available', 'electric', 12000),
  ('Chevrolet', 'Silverado', 2022, 'TRK-7890', 6, 'available', 'gasoline', 28000),
  ('Mercedes-Benz', 'Sprinter', 2021, 'VAN-2345', 15, 'available', 'diesel', 35000),
  ('Nissan', 'Leaf', 2023, 'ECO-6789', 5, 'available', 'electric', 5000),
  ('BMW', '330i', 2022, 'LUX-0123', 5, 'available', 'gasoline', 18000),
  ('Volkswagen', 'Transporter', 2020, 'VWT-4567', 9, 'maintenance', 'diesel', 55000),
  ('Hyundai', 'Ioniq', 2023, 'HYB-8901', 5, 'available', 'hybrid', 3000)
ON CONFLICT (license_plate) DO NOTHING;