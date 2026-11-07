/**
 * DỮ LIỆU GIẢ LẬP (mock) cho bản demo.
 *
 * Tên trường được đặt gần với API Du Lịch Thiên Nhiên để sau này chỉ cần
 * thay lớp đọc dữ liệu trong `lib/tour-repository.ts`:
 *   - /tour-rows            → Tour (thông tin chung, dùng cho danh sách)
 *   - /calendar/{tourId}    → Tour.departures (lịch khởi hành)
 *   - /price/{departureId}  → Departure.price*
 *   - /content/{tourId}     → Tour.itinerary, includes, excludes, notes...
 *
 * Nội dung tour chỉ để minh họa giao diện. Giá, ngày và lịch trình không
 * phải dữ liệu bán thật.
 */

export type DepartureStatus = "open" | "few" | "closed";

export interface Departure {
  id: string;
  /** ISO date, ví dụ 2026-11-11 */
  date: string;
  returnDate: string;
  priceAdult: number;
  priceChild: number;
  priceInfant: number;
  seatsLeft: number;
  status: DepartureStatus;
  flightOut: string;
  flightBack: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  meals?: string;
  /** Cho phép **in đậm** bằng cú pháp markdown đơn giản */
  body: string;
}

export interface Tour {
  id: string;
  code: string;
  slug: string;
  title: string;
  country: string;
  countries: string[];
  categories: string[];
  durationDays: number;
  durationNights: number;
  departCity: string;
  airline: string;
  hotelClass: string;
  /** Unsplash photo id (images.unsplash.com/photo-<id>) */
  images: string[];
  highlights: string[];
  promotion?: { title: string; items: string[] };
  itinerary: ItineraryDay[];
  includes: string[];
  excludes: string[];
  childPolicy: { age: string; price: string; note: string }[];
  depositPct: number;
  cancelRules: { when: string; fee: string }[];
  notes: string[];
  visaIncluded: boolean;
  departures: Departure[];
  relatedProductIds: string[];
}

/* -------------------------------------------------------------------------- */
/* Ảnh: Unsplash License (miễn phí cho mục đích thương mại, không cần xin phép) */
/* -------------------------------------------------------------------------- */
export const PHOTOS = {
  fenghuangRiver: "1510001618818-4b4e3d86bf0f", // Theodor Lundqvist
  fenghuangHouses: "1556837675-f48f2f7d3882", // Lucas Metz
  fenghuangWood: "1701153822906-2b740176bf9c", // Victor ZH
  tianmen: "1700580180134-724396022d40", // 阳 晨
  harbin: "1716308195021-cec9641f30bf", // lin zhaohai
  qingdao: "1519867110607-5263ca1d45f0", // xiaokang Zhang
  qingdao2: "1506007485620-6c580df991e6", // Archaique Chang
  shirakawa: "1744000457590-14e6ceae769c", // Yuta Koike
  longmen: "1749535644096-9c25ca55eb6e", // Weller Chen
  lijiang: "1661484427041-da1a9fcf2eb5", // ce amtic
  shenzhen: "1638150506280-c9edd8f690a3", // 不爱玩 先生
  cantonTower: "1544886660-a4f49fae3358", // Derch
} as const;

export const PHOTO_CREDITS: { id: string; author: string; place: string }[] = [
  { id: PHOTOS.fenghuangRiver, author: "Theodor Lundqvist", place: "Phượng Hoàng" },
  { id: PHOTOS.fenghuangHouses, author: "Lucas Metz", place: "Phượng Hoàng" },
  { id: PHOTOS.fenghuangWood, author: "Victor ZH", place: "Phượng Hoàng" },
  { id: PHOTOS.tianmen, author: "阳 晨", place: "Thiên Môn Sơn" },
  { id: PHOTOS.harbin, author: "lin zhaohai", place: "Cáp Nhĩ Tân" },
  { id: PHOTOS.qingdao, author: "xiaokang Zhang", place: "Thanh Đảo" },
  { id: PHOTOS.qingdao2, author: "Archaique Chang", place: "Thanh Đảo" },
  { id: PHOTOS.shirakawa, author: "Yuta Koike", place: "Shirakawa-go" },
  { id: PHOTOS.longmen, author: "Weller Chen", place: "Lạc Dương" },
  { id: PHOTOS.lijiang, author: "ce amtic", place: "Lệ Giang" },
  { id: PHOTOS.shenzhen, author: "不爱玩 先生", place: "Thẩm Quyến" },
  { id: PHOTOS.cantonTower, author: "Derch", place: "Quảng Châu" },
];

/* -------------------------------------------------------------------------- */
/* Nội dung dùng chung                                                         */
/* -------------------------------------------------------------------------- */
const INCLUDES = [
  "Vé máy bay khứ hồi theo đoàn, thuế sân bay 2 đầu, phí an ninh, phụ phí xăng dầu.",
  "Visa nhập cảnh theo đoàn (với tour có ghi chú visa đoàn).",
  "Khách sạn theo chương trình, tiêu chuẩn 2 người/phòng.",
  "Hướng dẫn viên suốt tuyến và hướng dẫn viên địa phương.",
  "Ăn uống và vé tham quan theo chương trình.",
];
const EXCLUDES = [
  "Hộ chiếu, chi phí chênh lệch phòng đơn.",
  "Visa làm tại TP.HCM nếu không xin được visa đoàn.",
  "Đồ uống, điện thoại, giặt ủi, hành lý quá cước.",
  "Chi phí cá nhân ngoài chương trình.",
  "Bồi dưỡng HDV và lái xe (bắt buộc): 200,000 ₫/khách/ngày.",
];
const CHILD_POLICY = [
  { age: "Dưới 2 tuổi", price: "30% giá người lớn", note: "Ngủ chung giường với bố mẹ" },
  { age: "Từ 2 đến dưới 12 tuổi", price: "75% / 90%", note: "Ngủ chung / có giường riêng" },
  { age: "Từ 12 tuổi trở lên", price: "100%", note: "Như người lớn" },
];
const CANCEL_RULES = [
  { when: "Sau khi đặt cọc", fee: "50% tiền cọc" },
  { when: "Từ 30 đến 10 ngày trước ngày đi", fee: "100% tiền cọc" },
  { when: "Từ 9 ngày đến 24 giờ trước ngày đi", fee: "100% giá tour" },
];
const NOTES = [
  "Hộ chiếu còn hạn trên 6 tháng tính từ ngày về, còn ít nhất 3 trang trống.",
  "Chuẩn bị 02 ảnh 4x6 nền trắng, chụp trong vòng 6 tháng.",
  "Khách từ 70 tuổi: mua thêm bảo hiểm cao cấp, có giấy xác nhận đủ sức khỏe và người thân dưới 60 tuổi đi cùng.",
  "Không tách đoàn trong suốt chương trình.",
  "Đoàn tối thiểu 10 khách. Nếu không đủ, Simplify Trip hoàn 100% tiền hoặc chuyển ngày khởi hành.",
];

function dep(
  id: string,
  date: string,
  returnDate: string,
  priceAdult: number,
  seatsLeft: number,
  flights: [string, string] = ["[Chuyến đi]", "[Chuyến về]"],
  closed = false,
): Departure {
  return {
    id,
    date,
    returnDate,
    priceAdult,
    priceChild: Math.round(priceAdult * 0.75),
    priceInfant: Math.round(priceAdult * 0.3),
    seatsLeft,
    status: closed ? "closed" : seatsLeft <= 5 ? "few" : "open",
    flightOut: flights[0],
    flightBack: flights[1],
  };
}

/** Lịch trình rút gọn cho các tour minh họa (chưa có nội dung chi tiết) */
function quickItinerary(stops: string[], days: number): ItineraryDay[] {
  return Array.from({ length: days }, (_, i) => {
    const place = stops[Math.min(i, stops.length - 1)];
    const title =
      i === 0 ? `TP.HCM - ${stops[0]}` : i === days - 1 ? `${place} - TP.HCM` : place;
    return {
      day: i + 1,
      title,
      meals: i === 0 ? "Ăn tối" : "Ăn sáng, trưa, tối",
      body:
        i === 0
          ? `Quý khách tập trung tại sân bay Tân Sơn Nhất, làm thủ tục bay đến **${stops[0]}**. Nhận phòng khách sạn, nghỉ đêm.`
          : i === days - 1
            ? "Trả phòng, tham quan mua sắm tự do. Xe đưa đoàn ra sân bay bay về TP. Hồ Chí Minh. Kết thúc chương trình."
            : `Tham quan các điểm nổi bật tại **${place}**. [Nội dung chi tiết sẽ đồng bộ từ API đối tác lữ hành.]`,
    };
  });
}

function baseTour(t: Partial<Tour> & Pick<Tour, "id" | "slug" | "title" | "durationDays" | "durationNights" | "airline" | "images" | "departures">, stops: string[]): Tour {
  return {
    code: `ST-${t.id.toUpperCase()}`,
    country: "Trung Quốc",
    countries: ["Trung Quốc"],
    categories: [],
    departCity: "TP. Hồ Chí Minh",
    hotelClass: "Khách sạn 4*",
    highlights: [],
    itinerary: quickItinerary(stops, t.durationDays),
    includes: INCLUDES,
    excludes: EXCLUDES,
    childPolicy: CHILD_POLICY,
    depositPct: 50,
    cancelRules: CANCEL_RULES,
    notes: NOTES,
    visaIncluded: true,
    relatedProductIds: ["esim-cn", "sim-cn", "visa-cn"],
    ...t,
  };
}

/* -------------------------------------------------------------------------- */
/* Danh sách tour                                                               */
/* -------------------------------------------------------------------------- */
export const TOURS: Tour[] = [
  {
    ...baseTour(
      {
        id: "phg01",
        slug: "phuong-hoang-co-tran-truong-gia-gioi",
        title: "Trung Quốc (Phượng Hoàng Cổ Trấn - Trương Gia Giới)",
        categories: ["Thu Đông", "Tour No Shopping"],
        durationDays: 5,
        durationNights: 5,
        airline: "VietJet Air",
        hotelClass: "Khách sạn 5* + 1 đêm khoáng nóng",
        images: [PHOTOS.fenghuangRiver, PHOTOS.fenghuangHouses, PHOTOS.tianmen, PHOTOS.fenghuangWood],
        departures: [
          dep("phg01-1103", "2026-11-03", "2026-11-08", 24999000, 0, ["VJ2552 · 16:05 – 20:30", "VJ2553 · 21:30 – 00:10"], true),
          dep("phg01-1111", "2026-11-11", "2026-11-16", 24999000, 12, ["VJ2552 · 16:05 – 20:30", "VJ2553 · 21:30 – 00:10"]),
          dep("phg01-1120", "2026-11-20", "2026-11-25", 25999000, 3, ["VJ2552 · 16:05 – 20:30", "VJ2553 · 21:30 – 00:10"]),
          dep("phg01-1127", "2026-11-27", "2026-12-02", 24999000, 18, ["VJ2552 · 16:05 – 20:30", "VJ2553 · 21:30 – 00:10"]),
        ],
      },
      ["Trương Gia Giới"],
    ),
    highlights: [
      "**Bức tranh sơn thủy 1.300 năm (Phượng Hoàng Cổ Trấn):** nhịp sống bình yên bên dòng Đà Giang, giao thoa văn hóa Miêu, Hán, Thổ Gia qua trang phục và nhà sàn gỗ.",
      "**Thất Tinh Sơn (1.528m):** quần thể thắng cảnh mới, cao nhất vùng Vĩnh Định tại Trương Gia Giới, 7 đỉnh nhấp nhô như chòm sao Bắc Đẩu.",
      "**Thiên Môn Sơn:** cáp treo 2 chiều, đường kính Skywalk sát vách núi và Cổng Trời 999 bậc.",
    ],
    promotion: {
      title: "ƯU ĐÃI MUA TOUR SỚM",
      items: [
        "Giảm 1,000,000 ₫/khách – áp dụng cho 10 khách người lớn mua tour đầu tiên",
        "Không cộng dồn ưu đãi",
      ],
    },
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Trương Gia Giới",
        meals: "Tự túc",
        body: "Quý khách tập trung tại Ga đi quốc tế sân bay Tân Sơn Nhất, cùng Hướng dẫn viên làm thủ tục đáp chuyến bay **VJ2552 (16:05 - 20:30)** bay thẳng đến **Trương Gia Giới**. Đáp tại sân bay quốc tế Hà Hoa, làm thủ tục nhập cảnh. Xe và hướng dẫn địa phương đón đoàn đến nhận phòng khách sạn, nghỉ đêm tại **Trương Gia Giới**.",
      },
      {
        day: 2,
        title: "Trương Gia Giới - Thiên Môn Sơn",
        meals: "Ăn sáng, trưa lẩu nấm, tối",
        body: "Trải nghiệm cáp treo 02 chiều tham quan **Công viên rừng quốc gia Thiên Môn Sơn**. Đường lên núi dài 11km nhưng chênh lệch độ cao lên đến 1.100m với 99 khúc cua ngoạn mục. Tham quan **Quỷ Cốc Sạn Đạo (Skywalk)** – con đường kính trong suốt sát vách núi dài 60m. Đi thang cuốn đến **Thiên Môn Động**, chụp ảnh với Cổng Trời. Tham quan **Tòa nhà 72 Kỳ Lâu** mang kiến trúc nhà sàn của người Miêu và Thổ Gia. Nghỉ đêm tại **Trương Gia Giới**.\n\n> Tự chọn buổi tối: siêu show “Trương Gia Giới Thiên Cổ Tình” – giá tham khảo 350 RMB/khách.",
      },
      {
        day: 3,
        title: "Trương Gia Giới",
        meals: "Ăn sáng, trưa, tối",
        body: "Tham quan **Động Cửu Thiên Huyền Nữ** – một trong những hang động karst ngầm lớn nhất châu Á, rộng hơn 2,8 triệu m², chia thành 03 tầng ngầm độc lập. Ngồi thuyền tham quan **Hồ Bảo Phong**, nơi chọn làm cảnh quay Hoa Quả Sơn trong phim Tây Du Ký. Quý khách **trải nghiệm ngâm khoáng nóng** tại khách sạn. Nghỉ đêm tại **Trương Gia Giới**.",
      },
      {
        day: 4,
        title: "Trương Gia Giới - Phượng Hoàng Cổ Trấn",
        meals: "Ăn sáng, trưa, tối",
        body: "Đoàn khởi hành đến **Phượng Hoàng Cổ Trấn** – hơn 1.300 năm tuổi, hình thành từ thời Đường. Tự do tham quan **Điếu Cước Lâu**, **Cầu Hồng Kiều**, **Bắc Môn Thành Lầu**, **Nhà cũ Thẩm Tùng Văn**, **Cầu Đá Nhảy**. Đặc biệt, **trải nghiệm mặc Miêu phục** trong Cổ Trấn. Nghỉ đêm tại **Phượng Hoàng Cổ Trấn**.",
      },
      {
        day: 5,
        title: "Phượng Hoàng Cổ Trấn - Trương Gia Giới - TP.HCM",
        meals: "Ăn sáng, trưa, tối",
        body: "Trả phòng. Đoàn di chuyển đến **Miêu Trại Tương Tây**, ngôi làng cổ mang đậm bản sắc văn hóa người Miêu. Xe đưa đoàn ra sân bay đáp chuyến **VJ2553 (21:30 - 00:10)** bay thẳng về **TP. Hồ Chí Minh**. Kết thúc chương trình.",
      },
    ],
  },
  baseTour(
    {
      id: "phg02",
      slug: "phuong-hoang-truong-gia-gioi-dong-gia",
      title: "Trung Quốc (Phượng Hoàng Cổ Trấn - Trương Gia Giới) – Đồng Giá",
      categories: ["Đồng Giá"],
      durationDays: 5,
      durationNights: 5,
      airline: "VietJet Air",
      images: [PHOTOS.fenghuangHouses, PHOTOS.fenghuangRiver, PHOTOS.tianmen],
      departures: [dep("phg02-1111", "2026-11-11", "2026-11-16", 18999000, 9), dep("phg02-1127", "2026-11-27", "2026-12-02", 18999000, 4)],
    },
    ["Trương Gia Giới", "Thiên Môn Sơn", "Trương Gia Giới", "Phượng Hoàng Cổ Trấn"],
  ),
  baseTour(
    {
      id: "tgg01",
      slug: "truong-gia-gioi-thien-mon-son",
      title: "Trung Quốc (Trương Gia Giới - Thiên Môn Sơn - Phượng Hoàng)",
      categories: ["Thu Đông"],
      durationDays: 5,
      durationNights: 5,
      airline: "VietJet Air",
      images: [PHOTOS.tianmen, PHOTOS.fenghuangWood, PHOTOS.fenghuangRiver],
      departures: [dep("tgg01-1203", "2026-12-03", "2026-12-08", 20999000, 15)],
    },
    ["Trương Gia Giới", "Thiên Môn Sơn", "Phượng Hoàng Cổ Trấn"],
  ),
  baseTour(
    {
      id: "hrb01",
      slug: "cap-nhi-tan-truot-tuyet",
      title: "Trung Quốc (Cáp Nhĩ Tân - Làng Tuyết Hương - Trượt Tuyết Á Bố Lực)",
      categories: ["Thu Đông"],
      durationDays: 5,
      durationNights: 4,
      airline: "Shandong Airlines",
      images: [PHOTOS.harbin, PHOTOS.qingdao],
      departures: [dep("hrb01-1212", "2026-12-12", "2026-12-16", 26999000, 20)],
    },
    ["Cáp Nhĩ Tân", "Làng Tuyết Hương", "Á Bố Lực", "Cáp Nhĩ Tân"],
  ),
  baseTour(
    {
      id: "tdo01",
      slug: "thanh-dao-cap-nhi-tan-tet",
      title: "Trung Quốc (Thanh Đảo - Cáp Nhĩ Tân)",
      categories: ["Tết Âm Lịch 2027"],
      durationDays: 6,
      durationNights: 6,
      airline: "Qingdao Airlines",
      images: [PHOTOS.qingdao, PHOTOS.harbin],
      departures: [dep("tdo01-0209", "2027-02-09", "2027-02-15", 46999000, 16)],
    },
    ["Thanh Đảo", "Cáp Nhĩ Tân", "Cáp Nhĩ Tân", "Thanh Đảo"],
  ),
  baseTour(
    {
      id: "tdj01",
      slug: "thanh-dao-nhat-ban-phu-si",
      title: "Thanh Đảo - Nhật Bản (Thanh Đảo - Nagoya - Shirakawago - Núi Phú Sĩ)",
      countries: ["Trung Quốc", "Nhật Bản"],
      categories: ["Tết Âm Lịch 2027"],
      durationDays: 7,
      durationNights: 6,
      airline: "Qingdao Airlines",
      hotelClass: "Khách sạn 4* + 1 đêm Onsen",
      visaIncluded: false,
      images: [PHOTOS.shirakawa, PHOTOS.qingdao2],
      departures: [dep("tdj01-0208", "2027-02-08", "2027-02-14", 58999000, 14)],
    },
    ["Thanh Đảo", "Nagoya", "Shirakawago", "Núi Phú Sĩ", "Tokyo", "Thanh Đảo"],
  ),
  baseTour(
    {
      id: "tdj02",
      slug: "thanh-dao-nhat-ban-vuon-hoa",
      title: "Thanh Đảo - Nhật Bản (Thanh Đảo - Nagoya - Shirakawago - Vườn Hoa)",
      countries: ["Trung Quốc", "Nhật Bản"],
      categories: ["Tết Âm Lịch 2027"],
      durationDays: 7,
      durationNights: 6,
      airline: "Qingdao Airlines",
      visaIncluded: false,
      images: [PHOTOS.qingdao2, PHOTOS.shirakawa],
      departures: [dep("tdj02-0208", "2027-02-08", "2027-02-14", 59999000, 2)],
    },
    ["Thanh Đảo", "Nagoya", "Shirakawago", "Vườn hoa Nabana", "Thanh Đảo"],
  ),
  baseTour(
    {
      id: "tch01",
      slug: "trinh-chau-lac-duong",
      title: "Trung Quốc (Trịnh Châu - Khai Phong - Đăng Phong - Lạc Dương)",
      durationDays: 6,
      durationNights: 5,
      airline: "China Southern Airlines",
      images: [PHOTOS.longmen],
      departures: [dep("tch01-0108", "2027-01-08", "2027-01-13", 31999000, 20), dep("tch01-0305", "2027-03-05", "2027-03-10", 31999000, 25)],
    },
    ["Trịnh Châu", "Khai Phong", "Thiếu Lâm Tự", "Lạc Dương", "Trịnh Châu"],
  ),
  baseTour(
    {
      id: "kmg01",
      slug: "con-minh-le-giang-shangrila",
      title: "Trung Quốc (Côn Minh - Đại Lý - Shangrila - Lệ Giang)",
      durationDays: 6,
      durationNights: 5,
      airline: "China Southern Airlines",
      images: [PHOTOS.lijiang],
      departures: [dep("kmg01-0117", "2027-01-17", "2027-01-22", 31999000, 18), dep("kmg01-0319", "2027-03-19", "2027-03-24", 31999000, 22)],
    },
    ["Côn Minh", "Đại Lý", "Shangrila", "Lệ Giang", "Côn Minh"],
  ),
  baseTour(
    {
      id: "szx01",
      slug: "tham-quyen-quang-chau-tet-duong-lich",
      title: "Trung Quốc (Thẩm Quyến - Quảng Châu) – Tết Dương Lịch",
      categories: ["Đồng Giá", "Tết Dương lịch 2027"],
      durationDays: 5,
      durationNights: 4,
      airline: "Shenzhen Airlines",
      hotelClass: "Khách sạn 4*",
      images: [PHOTOS.shenzhen, PHOTOS.cantonTower],
      departures: [dep("szx01-0101", "2027-01-01", "2027-01-05", 16999000, 11)],
    },
    ["Thẩm Quyến", "Thẩm Quyến", "Quảng Châu", "Quảng Châu"],
  ),
  baseTour(
    {
      id: "can01",
      slug: "tham-quyen-quang-chau",
      title: "Trung Quốc (Thẩm Quyến - Quảng Châu)",
      categories: ["Đồng Giá"],
      durationDays: 5,
      durationNights: 4,
      airline: "Shenzhen Airlines",
      images: [PHOTOS.cantonTower, PHOTOS.shenzhen],
      departures: [
        dep("can01-1120", "2026-11-20", "2026-11-24", 15999000, 21),
        dep("can01-1218", "2026-12-18", "2026-12-22", 15999000, 21),
        dep("can01-0115", "2027-01-15", "2027-01-19", 15999000, 25),
      ],
    },
    ["Thẩm Quyến", "Thẩm Quyến", "Quảng Châu", "Quảng Châu"],
  ),
  baseTour(
    {
      id: "kwe01",
      slug: "quy-duong-tay-giang-mieu-trai",
      title: "Trung Quốc (Quý Dương - Hưng Nghĩa - Bàn Châu - Tây Giang Miêu Trại)",
      durationDays: 5,
      durationNights: 5,
      airline: "Colorful Guizhou Airlines",
      images: [PHOTOS.fenghuangWood, PHOTOS.lijiang],
      departures: [
        dep("kwe01-1108", "2026-11-08", "2026-11-13", 23999000, 3),
        dep("kwe01-1113", "2026-11-13", "2026-11-18", 23999000, 14),
        dep("kwe01-1122", "2026-11-22", "2026-11-27", 23999000, 20),
      ],
    },
    ["Quý Dương", "Hưng Nghĩa", "Bàn Châu", "Tây Giang Miêu Trại"],
  ),
];

/* -------------------------------------------------------------------------- */
/* Sản phẩm bán kèm (lấy từ danh mục SIM/eSIM hiện có của Simplify Trip)        */
/* -------------------------------------------------------------------------- */
export interface RelatedProduct {
  id: string;
  kind: "esim" | "sim" | "visa";
  label: string;
  title: string;
  price: string;
  image?: string;
  href: string;
}

export const RELATED_PRODUCTS: RelatedProduct[] = [
  {
    id: "esim-cn",
    kind: "esim",
    label: "eSIM",
    title: "eSIM Trung Quốc Mainland Multi tốc độ cao 4G, sử dụng TikTok*",
    price: "30,000 ₫ - 1,570,000 ₫",
    image: "/brand/esim-cn.jpg",
    href: "https://simplifytrip.com/",
  },
  {
    id: "sim-cn",
    kind: "sim",
    label: "SIM vật lý",
    title: "SIM Trung Quốc đại lục (Multi) - TikTok",
    price: "44,000 ₫ - 1,579,000 ₫",
    image: "/brand/sim-cn.jpg",
    href: "https://simplifytrip.com/",
  },
  {
    id: "visa-cn",
    kind: "visa",
    label: "Dịch vụ mới",
    title: "Dịch vụ visa Trung Quốc – hồ sơ nhanh, đúng, đủ",
    price: "[Phí dịch vụ]",
    href: "#",
  },
];

export const DESTINATIONS = ["Trung Quốc", "Nhật Bản", "Thái Lan", "Hàn Quốc", "Đài Loan", "Singapore", "Dubai", "Châu Âu"];
export const CATEGORIES = ["Thu Đông", "Tết Dương lịch 2027", "Tết Âm Lịch 2027", "Đồng Giá", "Tour No Shopping"];
export const AIRLINES = ["VietJet Air", "China Southern Airlines", "Shenzhen Airlines", "Qingdao Airlines", "Shandong Airlines", "Colorful Guizhou Airlines"];
