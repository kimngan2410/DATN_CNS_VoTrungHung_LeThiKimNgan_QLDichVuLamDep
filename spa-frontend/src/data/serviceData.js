export const serviceCategories = [
  "Tất cả",
  "Chăm sóc da",
  "Massage",
  "Nail",
  "Tóc",
]

export const servicePriceRanges = [
  "Tất cả mức giá",
  "Dưới 500.000đ",
  "500.000đ - 1.000.000đ",
  "Trên 1.000.000đ",
]

export const serviceDurations = [
  "Tất cả thời lượng",
  "Dưới 60 phút",
  "60 - 90 phút",
  "Trên 90 phút",
]

export const sortOptions = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
]

export const services = [
  {
    id: 1,
    slug: "cham-soc-da-mat-chuyen-sau",
    category: "Chăm sóc da",
    title: "Chăm sóc da mặt chuyên sâu",
    description: "Làm sạch sâu, tẩy tế bào chết và cấp ẩm phục hồi da.",
    detailDescription: `
Dịch vụ chăm sóc da mặt chuyên sâu là liệu trình hỗ trợ làm sạch da, loại bỏ bã nhờn và tế bào chết, đồng thời kết hợp cấp ẩm và chăm sóc phục hồi da.

Công dụng dịch vụ:
- Hỗ trợ làm sạch sâu lỗ chân lông.
- Hỗ trợ cải thiện độ ẩm và độ mềm mịn của da.
- Góp phần thư giãn và chăm sóc da định kỳ.

Đối tượng phù hợp:
- Khách hàng có nhu cầu chăm sóc da cơ bản hoặc chuyên sâu.
- Khách hàng có làn da thiếu ẩm hoặc xỉn màu.

Lưu ý:
- Khách hàng nên trao đổi tình trạng da trước khi thực hiện.
- Cần tuân thủ hướng dẫn chăm sóc sau liệu trình nếu có.
`,
    price: 850000,
    duration: 90,
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: true,
  },
  {
    id: 2,
    slug: "massage-body-da-nong",
    category: "Massage",
    title: "Massage body đá nóng",
    description: "Thư giãn cơ bắp, giảm căng thẳng với đá nóng tự nhiên.",
    detailDescription: `
Dịch vụ massage body đá nóng sử dụng kỹ thuật massage kết hợp nhiệt từ đá nóng nhằm hỗ trợ thư giãn cơ thể và giảm cảm giác căng cứng cơ bắp.

Công dụng dịch vụ:
- Hỗ trợ thư giãn tinh thần và cơ thể.
- Hỗ trợ lưu thông tuần hoàn.
- Giảm cảm giác mỏi cơ ở vùng vai, lưng và gáy.

Đối tượng phù hợp:
- Người làm việc căng thẳng hoặc ngồi lâu.
- Khách hàng có nhu cầu thư giãn toàn thân.

Lưu ý:
- Nên thông báo tình trạng sức khỏe trước khi thực hiện.
- Không nên sử dụng khi cơ thể mệt mỏi quá mức hoặc sốt.
`,
    price: 650000,
    duration: 60,
    image:
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: true,
  },
  {
    id: 3,
    slug: "nail-art-cao-cap",
    category: "Nail",
    title: "Nail Art Cao Cấp",
    description: "Chăm sóc móng và thiết kế nghệ thuật theo yêu cầu.",
    detailDescription: `
Dịch vụ Nail Art Cao Cấp bao gồm chăm sóc móng, tạo form móng và thiết kế nghệ thuật theo nhu cầu khách hàng.

Công dụng dịch vụ:
- Tăng tính thẩm mỹ cho móng.
- Hỗ trợ chăm sóc móng và da quanh móng.
- Tạo kiểu dáng và phong cách phù hợp cá nhân.

Đối tượng phù hợp:
- Khách hàng có nhu cầu làm đẹp móng định kỳ.
- Khách tham dự sự kiện hoặc yêu thích nail nghệ thuật.

Lưu ý:
- Nên trao đổi mẫu thiết kế trước khi thực hiện.
- Hạn chế va chạm mạnh sau khi làm móng.
`,
    price: 350000,
    duration: 60,
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: true,
  },
  {
    id: 4,
    slug: "goi-dau-duong-sinh",
    category: "Tóc",
    title: "Gội đầu dưỡng sinh",
    description: "Gội đầu thảo dược kết hợp massage cổ vai gáy.",
    detailDescription: `
Dịch vụ gội đầu dưỡng sinh kết hợp làm sạch tóc, chăm sóc da đầu và massage thư giãn vùng đầu, cổ, vai gáy.

Công dụng dịch vụ:
- Hỗ trợ thư giãn và giảm căng thẳng.
- Giúp làm sạch da đầu và tóc.
- Hỗ trợ giảm cảm giác mỏi vùng cổ vai gáy.

Đối tượng phù hợp:
- Người làm việc áp lực cao.
- Khách có nhu cầu thư giãn nhanh.

Lưu ý:
- Không nên thực hiện khi da đầu có tổn thương hở.
- Nên giữ tóc khô thoáng sau liệu trình.
`,
    price: 250000,
    duration: 45,
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: true,
  },
  {
    id: 5,
    slug: "tri-lieu-mun-chuan-y-khoa",
    category: "Chăm sóc da",
    title: "Trị liệu mụn chuẩn y khoa",
    description: "Lấy nhân mụn chuẩn y khoa, chiếu ánh sáng sinh học.",
    detailDescription: `
Dịch vụ trị liệu mụn chuẩn y khoa hỗ trợ làm sạch da, xử lý nhân mụn đúng kỹ thuật và chăm sóc phục hồi sau trị liệu.

Công dụng dịch vụ:
- Hỗ trợ làm sạch da mụn.
- Hỗ trợ cải thiện bề mặt da.
- Góp phần làm dịu vùng da sau trị liệu.

Đối tượng phù hợp:
- Da dầu mụn.
- Da dễ bít tắc lỗ chân lông.

Lưu ý:
- Không tự xử lý mụn trước khi đến liệu trình.
- Cần tuân thủ hướng dẫn chăm sóc sau trị liệu.
`,
    price: 1200000,
    duration: 120,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    id: 6,
    slug: "massage-thai-co-truyen",
    category: "Massage",
    title: "Massage Thái cổ truyền",
    description: "Kéo giãn cơ thể, bấm huyệt theo phương pháp Thái Lan.",
    detailDescription: `
Dịch vụ massage Thái cổ truyền áp dụng các thao tác kéo giãn và bấm huyệt hỗ trợ thư giãn, giảm cảm giác căng cứng cơ và cải thiện độ linh hoạt của cơ thể.

Công dụng dịch vụ:
- Hỗ trợ thư giãn cơ bắp.
- Giúp giảm cảm giác căng cứng cơ.
- Hỗ trợ tăng độ linh hoạt cơ thể.

Đối tượng phù hợp:
- Người vận động nhiều hoặc ít vận động.
- Khách có nhu cầu massage trị liệu thư giãn.

Lưu ý:
- Cần thông báo tình trạng đau hoặc chấn thương nếu có.
- Không nên ăn quá no trước khi thực hiện.
`,
    price: 750000,
    duration: 90,
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    id: 7,
    slug: "phuc-hoi-toc-hu-ton",
    category: "Tóc",
    title: "Phục hồi tóc hư tổn",
    description: "Phục hồi keratin cho tóc uốn nhuộm nhiều lần.",
    detailDescription: `
Dịch vụ phục hồi tóc hư tổn tập trung chăm sóc sợi tóc bằng dưỡng chất chuyên sâu, hỗ trợ cải thiện độ mềm mượt và giảm tình trạng khô xơ.

Công dụng dịch vụ:
- Hỗ trợ phục hồi tóc khô xơ.
- Giúp tóc mềm và dễ vào nếp hơn.
- Góp phần bảo vệ tóc sau quá trình sử dụng hóa chất.

Đối tượng phù hợp:
- Tóc nhuộm, uốn hoặc xử lý hóa chất nhiều.
- Khách có nhu cầu phục hồi tóc định kỳ.

Lưu ý:
- Nên hạn chế sử dụng nhiệt cao sau phục hồi.
- Kết hợp chăm sóc tóc tại nhà theo hướng dẫn.
`,
    price: 850000,
    duration: 90,
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    id: 8,
    slug: "cham-soc-got-sen",
    category: "Nail",
    title: "Chăm sóc gót sen",
    description: "Chà gót chân, tẩy tế bào chết và dưỡng ẩm chuyên sâu.",
    detailDescription: `
Dịch vụ chăm sóc gót sen hỗ trợ làm sạch vùng gót chân, tẩy tế bào chết và dưỡng ẩm nhằm cải thiện cảm giác khô ráp ở bàn chân.

Công dụng dịch vụ:
- Hỗ trợ làm mềm vùng gót chân.
- Giúp làm sạch và chăm sóc da bàn chân.
- Mang lại cảm giác thư giãn và thoải mái.

Đối tượng phù hợp:
- Khách có vùng gót chân khô hoặc thô ráp.
- Khách có nhu cầu chăm sóc chân định kỳ.

Lưu ý:
- Không nên thực hiện nếu vùng chân có vết thương hở.
- Nên dưỡng ẩm bàn chân sau liệu trình để duy trì hiệu quả.
`,
    price: 200000,
    duration: 45,
    image:
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    id: 9,
    slug: "duong-trang-cap-am-chuyen-sau",
    category: "Chăm sóc da",
    title: "Dưỡng trắng cấp ẩm chuyên sâu",
    description: "Làm sáng da, cấp ẩm sâu và làm dịu da sau liệu trình.",
    detailDescription: `
Dịch vụ dưỡng trắng cấp ẩm chuyên sâu hỗ trợ bổ sung độ ẩm, chăm sóc bề mặt da và hỗ trợ cải thiện độ sáng của da.

Công dụng dịch vụ:
- Hỗ trợ cấp ẩm cho da.
- Giúp da mềm mại và sáng khỏe hơn.
- Hỗ trợ chăm sóc và duy trì tình trạng da ổn định.

Đối tượng phù hợp:
- Da khô hoặc thiếu ẩm.
- Khách có nhu cầu dưỡng da định kỳ.

Lưu ý:
- Nên kết hợp chống nắng và chăm sóc da tại nhà.
- Trao đổi tình trạng da trước khi thực hiện.
`,
    price: 990000,
    duration: 75,
    image:
      "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    id: 10,
    slug: "massage-co-vai-gay",
    category: "Massage",
    title: "Massage cổ vai gáy",
    description: "Giảm đau mỏi vùng vai gáy, thư giãn và hỗ trợ tuần hoàn.",
    detailDescription: `
Dịch vụ massage cổ vai gáy tập trung vào vùng cổ, vai và lưng trên nhằm hỗ trợ thư giãn cơ, giảm cảm giác căng cứng và mệt mỏi.

Công dụng dịch vụ:
- Hỗ trợ giảm cảm giác đau mỏi vùng cổ vai gáy.
- Giúp thư giãn cơ và giảm căng thẳng.
- Hỗ trợ cải thiện cảm giác thoải mái sau khi làm việc lâu.

Đối tượng phù hợp:
- Nhân viên văn phòng ngồi lâu.
- Người thường xuyên căng cơ vùng vai gáy.

Lưu ý:
- Cần thông báo nếu đang có chấn thương hoặc đau cấp tính.
- Không nên thực hiện khi cơ thể đang sốt hoặc quá mệt.
`,
    price: 450000,
    duration: 50,
    image:
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    id: 11,
    slug: "cat-duong-phuc-hoi-toc",
    category: "Tóc",
    title: "Cắt dưỡng phục hồi tóc",
    description: "Cắt tỉa gọn gàng kết hợp hấp dưỡng phục hồi tóc khô xơ.",
    detailDescription: `
Dịch vụ cắt dưỡng phục hồi tóc kết hợp cắt tỉa phần tóc hư tổn và chăm sóc tóc bằng dưỡng chất phù hợp nhằm hỗ trợ cải thiện độ mềm mượt của tóc.

Công dụng dịch vụ:
- Hỗ trợ loại bỏ phần tóc khô xơ, chẻ ngọn.
- Giúp tóc gọn gàng và dễ chăm sóc hơn.
- Hỗ trợ phục hồi và duy trì độ mềm mượt của tóc.

Đối tượng phù hợp:
- Khách có tóc khô, xơ hoặc chẻ ngọn.
- Khách muốn thay đổi kiểu tóc kết hợp chăm sóc tóc.

Lưu ý:
- Nên trao đổi mong muốn về kiểu tóc trước khi thực hiện.
- Hạn chế dùng nhiệt cao ngay sau liệu trình.
`,
    price: 550000,
    duration: 70,
    image:
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: false,
  },
  {
    id: 12,
    slug: "nail-gel-basic",
    category: "Nail",
    title: "Sơn gel basic",
    description: "Sơn gel bền màu, chăm sóc móng cơ bản và tạo độ bóng đẹp.",
    detailDescription: `
Dịch vụ sơn gel basic bao gồm chăm sóc móng cơ bản, làm sạch bề mặt móng và sơn gel theo màu khách hàng lựa chọn.

Công dụng dịch vụ:
- Tăng tính thẩm mỹ cho móng.
- Giúp màu móng bền và bóng hơn.
- Hỗ trợ chăm sóc móng cơ bản.

Đối tượng phù hợp:
- Khách hàng muốn làm đẹp móng đơn giản.
- Khách muốn màu móng bền hơn sơn thường.

Lưu ý:
- Không nên tự bóc lớp gel sau khi làm móng.
- Nên tháo gel đúng kỹ thuật để hạn chế ảnh hưởng đến móng thật.
`,
    price: 300000,
    duration: 55,
    image:
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=1200&q=80",
    ],
    isActive: true,
    isFeatured: false,
  },
]

export function formatPrice(price) {
  return `${price.toLocaleString("vi-VN")} ₫`
}