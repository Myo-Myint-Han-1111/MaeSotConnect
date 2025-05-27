// src/components/admin/LocationSelector.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

// Limited provinces data - only Bangkok, Chiang Mai, and Tak
const provinces = [
  {
    id: 1,
    provinceCode: 10,
    provinceNameEn: "Bangkok",
    provinceNameTh: "กรุงเทพมหานคร",
  },
  {
    id: 39,
    provinceCode: 50,
    provinceNameEn: "Chiang Mai",
    provinceNameTh: "เชียงใหม่",
  },
  { id: 51, provinceCode: 63, provinceNameEn: "Tak", provinceNameTh: "ตาก" },
];

// Districts for the three provinces
const districts = [
  // Bangkok districts (major ones)
  {
    id: 1,
    provinceCode: 10,
    districtCode: 1001,
    districtNameEn: "Phra Nakhon",
    districtNameTh: "พระนคร",
    postalCode: 10200,
  },
  {
    id: 2,
    provinceCode: 10,
    districtCode: 1002,
    districtNameEn: "Dusit",
    districtNameTh: "ดุสิต",
    postalCode: 10300,
  },
  {
    id: 3,
    provinceCode: 10,
    districtCode: 1003,
    districtNameEn: "Nong Chok",
    districtNameTh: "หนองจอก",
    postalCode: 10530,
  },
  {
    id: 4,
    provinceCode: 10,
    districtCode: 1004,
    districtNameEn: "Bang Rak",
    districtNameTh: "บางรัก",
    postalCode: 10500,
  },
  {
    id: 5,
    provinceCode: 10,
    districtCode: 1005,
    districtNameEn: "Bang Khen",
    districtNameTh: "บางเขน",
    postalCode: 10220,
  },
  {
    id: 6,
    provinceCode: 10,
    districtCode: 1006,
    districtNameEn: "Bang Kapi",
    districtNameTh: "บางกะปิ",
    postalCode: 10240,
  },
  {
    id: 7,
    provinceCode: 10,
    districtCode: 1007,
    districtNameEn: "Pathum Wan",
    districtNameTh: "ปทุมวัน",
    postalCode: 10330,
  },
  {
    id: 8,
    provinceCode: 10,
    districtCode: 1008,
    districtNameEn: "Pom Prap Sattru Phai",
    districtNameTh: "ป้อมปราบศัตรูพ่าย",
    postalCode: 10100,
  },
  {
    id: 9,
    provinceCode: 10,
    districtCode: 1009,
    districtNameEn: "Phra Khanong",
    districtNameTh: "พระโขนง",
    postalCode: 10260,
  },
  {
    id: 10,
    provinceCode: 10,
    districtCode: 1010,
    districtNameEn: "Min Buri",
    districtNameTh: "มีนบุรี",
    postalCode: 10510,
  },
  {
    id: 11,
    provinceCode: 10,
    districtCode: 1011,
    districtNameEn: "Lat Krabang",
    districtNameTh: "ลาดกระบัง",
    postalCode: 10520,
  },
  {
    id: 12,
    provinceCode: 10,
    districtCode: 1012,
    districtNameEn: "Yan Nawa",
    districtNameTh: "ยานนาวา",
    postalCode: 10120,
  },
  {
    id: 13,
    provinceCode: 10,
    districtCode: 1013,
    districtNameEn: "Samphanthawong",
    districtNameTh: "สัมพันธวงศ์",
    postalCode: 10100,
  },
  {
    id: 14,
    provinceCode: 10,
    districtCode: 1014,
    districtNameEn: "Phaya Thai",
    districtNameTh: "พญาไท",
    postalCode: 10400,
  },
  {
    id: 15,
    provinceCode: 10,
    districtCode: 1015,
    districtNameEn: "Thon Buri",
    districtNameTh: "ธนบุรี",
    postalCode: 10600,
  },
  {
    id: 16,
    provinceCode: 10,
    districtCode: 1016,
    districtNameEn: "Bangkok Yai",
    districtNameTh: "บางกอกใหญ่",
    postalCode: 10600,
  },
  {
    id: 17,
    provinceCode: 10,
    districtCode: 1017,
    districtNameEn: "Huai Khwang",
    districtNameTh: "ห้วยขวาง",
    postalCode: 10310,
  },
  {
    id: 18,
    provinceCode: 10,
    districtCode: 1018,
    districtNameEn: "Khlong Toei",
    districtNameTh: "คลองเตย",
    postalCode: 10110,
  },
  {
    id: 19,
    provinceCode: 10,
    districtCode: 1019,
    districtNameEn: "Taling Chan",
    districtNameTh: "ตลิ่งชน",
    postalCode: 10170,
  },
  {
    id: 20,
    provinceCode: 10,
    districtCode: 1020,
    districtNameEn: "Bangkok Noi",
    districtNameTh: "บางกอกน้อย",
    postalCode: 10700,
  },
  {
    id: 21,
    provinceCode: 10,
    districtCode: 1021,
    districtNameEn: "Bang Khun Thian",
    districtNameTh: "บางขุนเทียน",
    postalCode: 10150,
  },
  {
    id: 22,
    provinceCode: 10,
    districtCode: 1022,
    districtNameEn: "Phasi Charoen",
    districtNameTh: "ภาษีเจริญ",
    postalCode: 10160,
  },
  {
    id: 23,
    provinceCode: 10,
    districtCode: 1023,
    districtNameEn: "Nong Khaem",
    districtNameTh: "หนองแขม",
    postalCode: 10160,
  },
  {
    id: 24,
    provinceCode: 10,
    districtCode: 1024,
    districtNameEn: "Rat Burana",
    districtNameTh: "ราษฎร์บูรณะ",
    postalCode: 10140,
  },
  {
    id: 25,
    provinceCode: 10,
    districtCode: 1025,
    districtNameEn: "Bang Phlat",
    districtNameTh: "บางพลัด",
    postalCode: 10700,
  },
  {
    id: 26,
    provinceCode: 10,
    districtCode: 1026,
    districtNameEn: "Din Daeng",
    districtNameTh: "ดินแดง",
    postalCode: 10400,
  },
  {
    id: 27,
    provinceCode: 10,
    districtCode: 1027,
    districtNameEn: "Bueng Kum",
    districtNameTh: "บึงกุ่ม",
    postalCode: 10230,
  },
  {
    id: 28,
    provinceCode: 10,
    districtCode: 1028,
    districtNameEn: "Sai Mai",
    districtNameTh: "สายไหม",
    postalCode: 10220,
  },
  {
    id: 29,
    provinceCode: 10,
    districtCode: 1029,
    districtNameEn: "Khan Na Yao",
    districtNameTh: "คันนายาว",
    postalCode: 10230,
  },
  {
    id: 30,
    provinceCode: 10,
    districtCode: 1030,
    districtNameEn: "Saphan Sung",
    districtNameTh: "สะพานสูง",
    postalCode: 10240,
  },
  {
    id: 31,
    provinceCode: 10,
    districtCode: 1031,
    districtNameEn: "Wang Thonglang",
    districtNameTh: "วังทองหลาง",
    postalCode: 10310,
  },
  {
    id: 32,
    provinceCode: 10,
    districtCode: 1032,
    districtNameEn: "Khlong San",
    districtNameTh: "คลองสาน",
    postalCode: 10600,
  },
  {
    id: 33,
    provinveCode: 10,
    districtCode: 1033,
    districtNameEn: "Bang Sue",
    districtNameTh: "บางซื่อ",
    postalCode: 10800,
  },
  {
    id: 34,
    provinceCode: 10,
    districtCode: 1034,
    districtNameEn: "Chatuchak",
    districtNameTh: "จตุจักร",
    postalCode: 10900,
  },
  {
    id: 35,
    provinceCode: 10,
    districtCode: 1035,
    districtNameEn: "Bang Bon",
    districtNameTh: "บางบอน",
    postalCode: 10150,
  },
  {
    id: 36,
    provinceCode: 10,
    districtCode: 1036,
    districtNameEn: "Prawet",
    districtNameTh: "ประเวศ",
    postalCode: 10250,
  },
  {
    id: 37,
    provinceCode: 10,
    districtCode: 1037,
    districtNameEn: "Khlong Samwa",
    districtNameTh: "คลองสามวา",
    postalCode: 10510,
  },
  {
    id: 38,
    provinceCode: 10,
    districtCode: 1038,
    districtNameEn: "Lak Si",
    districtNameTh: "หลักสี่",
    postalCode: 10210,
  },
  {
    id: 39,
    provinceCode: 10,
    districtCode: 1039,
    districtNameEn: "Suan Luang",
    districtNameTh: "สวนหลวง",
    postalCode: 10250,
  },
  {
    id: 40,
    provinceCode: 10,
    districtCode: 1040,
    districtNameEn: "Chom Thong",
    districtNameTh: "จอมทอง",
    postalCode: 10150,
  },
  {
    id: 41,
    provinceCode: 10,
    districtCode: 1041,
    districtNameEn: "Don Mueang",
    districtNameTh: "ดอนเมือง",
    postalCode: 10210,
  },
  {
    id: 42,
    provinceCode: 10,
    districtCode: 1042,
    districtNameEn: "Ratchathewi",
    districtNameTh: "ราชเทวี",
    postalCode: 10400,
  },
  {
    id: 43,
    provinceCode: 10,
    districtCode: 1043,
    districtNameEn: "Lat Phrao",
    districtNameTh: "ลาดพร้าว",
    postalCode: 10230,
  },
  {
    id: 44,
    provinceCode: 10,
    districtCode: 1044,
    districtNameEn: "Watthana",
    districtNameTh: "วัฒนา",
    postalCode: 10110,
  },
  {
    id: 45,
    provinceCode: 10,
    districtCode: 1045,
    districtNameEn: "Bang Khae",
    districtNameTh: "บางแค",
    postalCode: 10160,
  },
  {
    id: 46,
    provinceCode: 10,
    districtCode: 1046,
    districtNameEn: "Lak Song",
    districtNameTh: "หลักสอง",
    postalCode: 10160,
  },
  {
    id: 47,
    provinceCode: 10,
    districtCode: 1047,
    districtNameEn: "Sathon",
    districtNameTh: "สาทร",
    postalCode: 10120,
  },
  {
    id: 48,
    provinceCode: 10,
    districtCode: 1048,
    districtNameEn: "Bang Na",
    districtNameTh: "บางนา",
    postalCode: 10260,
  },
  {
    id: 49,
    provinceCode: 10,
    districtCode: 1049,
    districtNameEn: "Vadhana",
    districtNameTh: "วัฒนา",
    postalCode: 10110,
  },
  {
    id: 50,
    provinceCode: 10,
    districtCode: 1050,
    districtNameEn: "Thung Khru",
    districtNameTh: "ทุ่งครุ",
    postalCode: 10140,
  },

  // Chiang Mai districts
  {
    id: 100,
    provinceCode: 50,
    districtCode: 5001,
    districtNameEn: "Mueang Chiang Mai",
    districtNameTh: "เมืองเชียงใหม่",
    postalCode: 50000,
  },
  {
    id: 101,
    provinceCode: 50,
    districtCode: 5002,
    districtNameEn: "Chom Thong",
    districtNameTh: "จอมทอง",
    postalCode: 50160,
  },
  {
    id: 102,
    provinceCode: 50,
    districtCode: 5003,
    districtNameEn: "Mae Chaem",
    districtNameTh: "แม่แจ่ม",
    postalCode: 50270,
  },
  {
    id: 103,
    provinceCode: 50,
    districtCode: 5004,
    districtNameEn: "Chiang Dao",
    districtNameTh: "เชียงดาว",
    postalCode: 50170,
  },
  {
    id: 104,
    provinceCode: 50,
    districtCode: 5005,
    districtNameEn: "Doi Saket",
    districtNameTh: "ดอยสะเก็ด",
    postalCode: 50220,
  },
  {
    id: 105,
    provinceCode: 50,
    districtCode: 5006,
    districtNameEn: "Mae Taeng",
    districtNameTh: "แม่แตง",
    postalCode: 50150,
  },
  {
    id: 106,
    provinceCode: 50,
    districtCode: 5007,
    districtNameEn: "Mae Rim",
    districtNameTh: "แม่ริม",
    postalCode: 50180,
  },
  {
    id: 107,
    provinceCode: 50,
    districtCode: 5008,
    districtNameEn: "Samoeng",
    districtNameTh: "สะเมิง",
    postalCode: 50250,
  },
  {
    id: 108,
    provinceCode: 50,
    districtCode: 5009,
    districtNameEn: "Fang",
    districtNameTh: "ฝาง",
    postalCode: 50110,
  },
  {
    id: 109,
    provinceCode: 50,
    districtCode: 5010,
    districtNameEn: "Mae Ai",
    districtNameTh: "แม่อาย",
    postalCode: 50280,
  },
  {
    id: 110,
    provinceCode: 50,
    districtCode: 5011,
    districtNameEn: "Phrao",
    districtNameTh: "พร้าว",
    postalCode: 50190,
  },
  {
    id: 111,
    provinveCode: 50,
    districtCode: 5012,
    districtNameEn: "San Pa Tong",
    districtNameTh: "สันป่าตอง",
    postalCode: 50120,
  },
  {
    id: 112,
    provinceCode: 50,
    districtCode: 5013,
    districtNameEn: "San Kamphaeng",
    districtNameTh: "สันกำแพง",
    postalCode: 50130,
  },
  {
    id: 113,
    provinceCode: 50,
    districtCode: 5014,
    districtNameEn: "San Sai",
    districtNameTh: "สันทราย",
    postalCode: 50210,
  },
  {
    id: 114,
    provinceCode: 50,
    districtCode: 5015,
    districtNameEn: "Hang Dong",
    districtNameTh: "หางดง",
    postalCode: 50230,
  },
  {
    id: 115,
    provinceCode: 50,
    districtCode: 5016,
    districtNameEn: "Hot",
    districtNameTh: "ฮอด",
    postalCode: 50240,
  },
  {
    id: 116,
    provinceCode: 50,
    districtCode: 5017,
    districtNameEn: "Doi Tao",
    districtNameTh: "ดอยเต่า",
    postalCode: 50260,
  },
  {
    id: 117,
    provinceCode: 50,
    districtCode: 5018,
    districtNameEn: "Omkoi",
    districtNameTh: "อมก๋อย",
    postalCode: 50310,
  },
  {
    id: 118,
    provinceCode: 50,
    districtCode: 5019,
    districtNameEn: "Saraphi",
    districtNameTh: "สารภี",
    postalCode: 50140,
  },
  {
    id: 119,
    provinceCode: 50,
    districtCode: 5020,
    districtNameEn: "Wiang Haeng",
    districtNameTh: "เวียงแหง",
    postalCode: 50350,
  },
  {
    id: 120,
    provinceCode: 50,
    districtCode: 5021,
    districtNameEn: "Chai Prakan",
    districtNameTh: "ชัยปราการ",
    postalCode: 50320,
  },
  {
    id: 121,
    provinceCode: 50,
    districtCode: 5022,
    districtNameEn: "Mae Wang",
    districtNameTh: "แม่วาง",
    postalCode: 50360,
  },
  {
    id: 122,
    provinceCode: 50,
    districtCode: 5023,
    districtNameEn: "Mae On",
    districtNameTh: "แม่ออน",
    postalCode: 50130,
  },
  {
    id: 123,
    provinceCode: 50,
    districtCode: 5024,
    districtNameEn: "Doi Lo",
    districtNameTh: "ดอยหล่อ",
    postalCode: 50160,
  },
  {
    id: 124,
    provinceCode: 50,
    districtCode: 5025,
    districtNameEn: "Galyani Vadhana",
    districtNameTh: "กัลยาณิวัฒนา",
    postalCode: 50180,
  },

  // Tak province districts (all districts)
  {
    id: 300,
    provinceCode: 63,
    districtCode: 6301,
    districtNameEn: "Mueang Tak",
    districtNameTh: "เมืองตาก",
    postalCode: 63000,
  },
  {
    id: 301,
    provinceCode: 63,
    districtCode: 6302,
    districtNameEn: "Mae Sot",
    districtNameTh: "แม่สอด",
    postalCode: 63110,
  },
  {
    id: 302,
    provinceCode: 63,
    districtCode: 6303,
    districtNameEn: "Mae Ramat",
    districtNameTh: "แม่ระมาด",
    postalCode: 63140,
  },
  {
    id: 303,
    provinceCode: 63,
    districtCode: 6304,
    districtNameEn: "Tha Song Yang",
    districtNameTh: "ท่าสองยาง",
    postalCode: 63150,
  },
  {
    id: 304,
    provinceCode: 63,
    districtCode: 6305,
    districtNameEn: "Ban Tak",
    districtNameTh: "บ้านตาก",
    postalCode: 63120,
  },
  {
    id: 305,
    provinceCode: 63,
    districtCode: 6306,
    districtNameEn: "Sam Ngao",
    districtNameTh: "สามเงา",
    postalCode: 63130,
  },
  {
    id: 306,
    provinceCode: 63,
    districtCode: 6307,
    districtNameEn: "Phop Phra",
    districtNameTh: "โพธิ์พระ",
    postalCode: 63160,
  },
  {
    id: 307,
    provinceCode: 63,
    districtCode: 6308,
    districtNameEn: "Um Phang",
    districtNameTh: "อุ้มผาง",
    postalCode: 63170,
  },
  {
    id: 308,
    provinceCode: 63,
    districtCode: 6309,
    districtNameEn: "Wang Chao",
    districtNameTh: "วังเจ้า",
    postalCode: 63180,
  },
];

interface LocationData {
  province: string;
  district: string;
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (data: LocationData) => void;
  disabled?: boolean;
}

export default function LocationSelector({
  value,
  onChange,
  disabled = false,
}: LocationSelectorProps) {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);
  const [availableDistricts, setAvailableDistricts] = useState<
    typeof districts
  >([]);

  // Filter districts based on selected province
  useEffect(() => {
    if (selectedProvinceCode) {
      const filteredDistricts = districts.filter(
        (district) => district.provinceCode === selectedProvinceCode
      );
      setAvailableDistricts(filteredDistricts);
    } else {
      setAvailableDistricts([]);
    }
  }, [selectedProvinceCode]);

  // Initialize selected province from existing value
  useEffect(() => {
    if (value.province) {
      const province = provinces.find(
        (p) => p.provinceNameEn === value.province
      );
      if (province) {
        setSelectedProvinceCode(province.provinceCode);
      }
    }
  }, [value.province]);

  const handleProvinceChange = (provinceNameEn: string) => {
    const selectedProvince = provinces.find(
      (p) => p.provinceNameEn === provinceNameEn
    );
    if (selectedProvince) {
      setSelectedProvinceCode(selectedProvince.provinceCode);
      // Clear district when province changes
      onChange({
        province: provinceNameEn,
        district: "",
      });
    }
  };

  const handleDistrictChange = (districtNameEn: string) => {
    onChange({
      province: value.province, // ADD this line
      district: districtNameEn,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location">
          <MapPin className="h-4 w-4 inline mr-1" />
          Location Details
        </Label>
      </div>

      {/* Province Selection */}
      <div className="space-y-2">
        <Label htmlFor="province">Province</Label>
        <Select
          value={value.province}
          onValueChange={handleProvinceChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a province" />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.provinceNameEn}>
                {province.provinceNameEn} ({province.provinceNameTh})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District Selection */}
      <div className="space-y-2">
        <Label htmlFor="district">District</Label>
        <Select
          value={value.district}
          onValueChange={handleDistrictChange}
          disabled={disabled || !selectedProvinceCode}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                selectedProvinceCode
                  ? "Select a district"
                  : "Please select a province first"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
            {availableDistricts.map((district) => (
              <SelectItem key={district.id} value={district.districtNameEn}>
                {district.districtNameEn} ({district.districtNameTh})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {availableDistricts.length === 0 && selectedProvinceCode && (
          <p className="text-xs text-muted-foreground">
            No districts available for selected province. You can still save the
            course with just the province selected.
          </p>
        )}
      </div>
    </div>
  );
}
