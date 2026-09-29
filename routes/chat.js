import express from "express";

import {
  users,
  donors,
  bloodRequests,
  bloodCenters,
  medicines,
  hospitals,
} from "../data/store.js";

const router = express.Router();

// ============================================================
// Helpers
// ============================================================

function normalizeText(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getUser(userId) {
  if (!userId) {
    return null;
  }

  return users.find(
    (user) => user.id === userId
  );
}

function getAvailableDonorsCount() {
  if (!Array.isArray(donors)) {
    return 0;
  }

  return donors.filter(
    (donor) =>
      donor.available !== false
  ).length;
}

function getActiveBloodRequests() {
  if (!Array.isArray(bloodRequests)) {
    return [];
  }

  return bloodRequests.filter(
    (request) =>
      request.status !== "مكتمل" &&
      request.status !== "تم الرفض" &&
      request.status !== "تم الإلغاء" &&
      request.requestType !==
        "direct-donation" &&
      request.requestType !==
        "blood-bank"
  );
}

function searchMedicines(query) {
  if (
    !query ||
    !Array.isArray(medicines)
  ) {
    return [];
  }

  const value =
    normalizeText(query);

  if (!value) {
    return [];
  }

  return medicines
    .filter((medicine) => {
      const name =
        normalizeText(
          medicine.name
        );

      const genericName =
        normalizeText(
          medicine.genericName
        );

      const category =
        normalizeText(
          medicine.category
        );

      return (
        name.includes(value) ||
        genericName.includes(value) ||
        category.includes(value)
      );
    })
    .slice(0, 5);
}

function findCenters(query = "") {
  if (!Array.isArray(bloodCenters)) {
    return [];
  }

  const value =
    normalizeText(query);

  if (!value) {
    return bloodCenters.slice(0, 5);
  }

  return bloodCenters
    .filter((center) => {
      const name =
        normalizeText(
          center.name
        );

      const city =
        normalizeText(
          center.city
        );

      const governorate =
        normalizeText(
          center.governorate
        );

      const address =
        normalizeText(
          center.address
        );

      return (
        name.includes(value) ||
        city.includes(value) ||
        governorate.includes(value) ||
        address.includes(value)
      );
    })
    .slice(0, 5);
}

function getCenterInfo(center) {
  if (!center) {
    return "";
  }

  const parts = [];

  if (center.name) {
    parts.push(
      `🏥 ${center.name}`
    );
  }

  if (
    center.city ||
    center.governorate
  ) {
    parts.push(
      `📍 ${[
        center.city,
        center.governorate,
      ]
        .filter(Boolean)
        .join("، ")}`
    );
  }

  if (center.phone) {
    parts.push(
      `📞 ${center.phone}`
    );
  }

  if (center.workingHours) {
    parts.push(
      `🕐 ${center.workingHours}`
    );
  }

  return parts.join("\n");
}

// ============================================================
// Medicine helpers
// ============================================================

function cleanMedicineQuery(text) {
  let value = normalizeText(text);

  const phrasesToRemove = [
    "عايز أبحث عن دواء",
    "عايز ابحث عن دواء",
    "عايز أبحث عن دوا",
    "عايز ابحث عن دوا",
    "ابحث عن دواء",
    "ابحث عن دوا",
    "بحث عن دواء",
    "بحث عن دوا",
    "ممكن أبحث عن دواء",
    "ممكن ابحث عن دواء",
    "ممكن دواء",
    "عايز دواء",
    "عايزة دواء",
    "عايز دوا",
    "عايزة دوا",
    "دواء اسمه",
    "دوا اسمه",
    "اسم الدواء",
    "اسم دوا",
    "دواء",
    "دوا",
    "عن"
  ];

  phrasesToRemove.forEach(
    (phrase) => {
      value = value.replace(
        normalizeText(phrase),
        ""
      );
    }
  );

  return value
    .replace(
      /^(لي|لـ|لل|في|من|هو)\s+/,
      ""
    )
    .trim();
}

function getMedicineResultsFromText(text) {
  if (!Array.isArray(medicines)) {
    return [];
  }

  const cleaned =
    cleanMedicineQuery(text);

  if (cleaned) {
    const directResults =
      searchMedicines(cleaned);

    if (directResults.length) {
      return directResults;
    }
  }

  return [];
}

// ============================================================
// Governorates
// ============================================================

const governorates = [
  "الشرقية",
  "القاهرة",
  "القليوبية",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "الغربية",
  "المنوفية",
  "البحيرة",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
];

function getMatchedGovernorate(text) {
  return governorates.find(
    (governorate) =>
      text.includes(
        normalizeText(
          governorate
        )
      )
  );
}

// ============================================================
// Center response
// ============================================================

function formatCentersReply(
  centers,
  title = ""
) {
  if (!centers.length) {
    return "مش لاقي مراكز دم متاحة حاليًا في البيانات.";
  }

  const centerText =
    centers
      .map(
        (
          center,
          index
        ) =>
          `${index + 1}. ${getCenterInfo(
            center
          )}`
      )
      .join("\n\n");

  return (
    (title
      ? `${title}\n\n`
      : "") +
    centerText
  );
}

// ============================================================
// POST /api/chat
// ============================================================

router.post(
  "/",
  (req, res) => {
    try {
      const {
        message,
        userId,
      } = req.body;

      if (
        !message ||
        !String(message).trim()
      ) {
        return res.status(400).json({
          error:
            "الرسالة مطلوبة",
        });
      }

      const text =
        normalizeText(message);

      const user =
        getUser(userId);

      // ======================================================
      // Greeting
      // ======================================================

      if (
        text.includes(
          "السلام عليكم"
        ) ||
        text.includes(
          "السلام عليكم ورحمة الله"
        )
      ) {
        return res.json({
          reply:
            "وعليكم السلام ورحمة الله وبركاته 🌷\nأهلاً بيك في نبض الأمل، إزاي أقدر أساعدك؟",
        });
      }

      if (
        text === "اهلا" ||
        text === "أهلا" ||
        text === "اهلاً" ||
        text === "أهلاً" ||
        text === "هاي" ||
        text === "hello" ||
        text === "hi"
      ) {
        return res.json({
          reply:
            "أهلاً بيك 🌷\nأنا مساعد نبض الأمل. أقدر أساعدك في الدم، المتبرعين، مراكز الدم، والأدوية.",
        });
      }

      // ======================================================
      // Help
      // ======================================================

      if (
        text.includes("مساعدة") ||
        text.includes(
          "تقدر تعمل ايه"
        ) ||
        text.includes(
          "تقدر تساعدني"
        ) ||
        text.includes(
          "ممكن تساعدني"
        ) ||
        text.includes(
          "ايه الخدمات"
        ) ||
        text.includes(
          "الخدمات"
        )
      ) {
        return res.json({
          reply:
            "أقدر أساعدك في:\n\n" +
            "🩸 طلب الدم\n" +
            "🔎 البحث عن متبرعين\n" +
            "🏥 مراكز وبنوك الدم\n" +
            "📅 مواعيد التبرع\n" +
            "💊 البحث عن الأدوية\n" +
            "🏨 المستشفيات\n\n" +
            "اكتبلي محتاج إيه وأنا هحاول أساعدك.",
        });
      }

      // ======================================================
      // Blood centers - governorate first
      // ======================================================

      const matchedGovernorate =
        getMatchedGovernorate(
          text
        );

      const askingForCenter =
        text.includes(
          "مركز دم"
        ) ||
        text.includes(
          "مراكز الدم"
        ) ||
        text.includes(
          "بنك دم"
        ) ||
        text.includes(
          "بنوك الدم"
        ) ||
        text.includes(
          "مركز للتبرع"
        ) ||
        text.includes(
          "مراكز للتبرع"
        ) ||
        (
          text.includes("مركز") &&
          text.includes("دم")
        );

      if (
        matchedGovernorate &&
        askingForCenter
      ) {
        const centers =
          findCenters(
            matchedGovernorate
          );

        if (!centers.length) {
          return res.json({
            reply:
              `مش لاقي مركز دم مسجل حاليًا في ${matchedGovernorate}.`,
          });
        }

        return res.json({
          reply:
            formatCentersReply(
              centers,
              `🏥 المراكز المسجلة في ${matchedGovernorate}:`
            ),
        });
      }

      // ======================================================
      // Blood centers - general
      // ======================================================

      if (
        askingForCenter
      ) {
        const centers =
          findCenters();

        if (!centers.length) {
          return res.json({
            reply:
              "مش لاقي مراكز دم متاحة حاليًا في البيانات.",
          });
        }

        return res.json({
          reply:
            `عندنا حاليًا ${bloodCenters.length} مركز/بنك دم مسجل.\n\n` +
            `دي بعض المراكز المتاحة:\n\n` +
            formatCentersReply(
              centers
            ) +
            "\n\nولو عايز مركز معين أو محافظة معينة، اكتب اسم المحافظة.",
        });
      }

      // ======================================================
      // Donors
      // ======================================================

      const askingForDonor =
        text.includes(
          "متبرع"
        ) ||
        text.includes(
          "متبرعين"
        ) ||
        text.includes(
          "متبرع مناسب"
        ) ||
        text.includes(
          "دونر"
        );

      if (
        askingForDonor
      ) {
        const available =
          getAvailableDonorsCount();

        return res.json({
          reply:
            `حاليًا عندنا ${available} متبرع متاح في بيانات النظام.\n\n` +
            "ولو عايز أبحث لك عن متبرع مناسب، اكتبلي فصيلة الدم المطلوبة، وممكن كمان تقول المحافظة أو الموقع لو متاح.",
        });
      }

      // ======================================================
      // Blood requests
      // ======================================================

      const askingForBlood =
        text.includes(
          "طلب دم"
        ) ||
        text.includes(
          "محتاج دم"
        ) ||
        text.includes(
          "عايز دم"
        ) ||
        text.includes(
          "محتاج فصيلة"
        ) ||
        text.includes(
          "طلب فصيلة"
        );

      if (
        askingForBlood
      ) {
        const activeRequests =
          getActiveBloodRequests();

        return res.json({
          reply:
            "🩸 تقدر تعمل طلب دم من قسم التبرع بالدم.\n\n" +
            `حاليًا يوجد ${activeRequests.length} طلب دم عام نشط في النظام.\n\n` +
            "لو عايز تعمل طلب جديد، ادخل على قسم طلب الدم وحدد فصيلة الدم والمستشفى ودرجة الاستعجال.",
        });
      }

      // ======================================================
      // Donation appointment
      // ======================================================

      if (
        text.includes(
          "موعد"
        ) ||
        text.includes(
          "احجز"
        ) ||
        text.includes(
          "حجز"
        ) ||
        text.includes(
          "تبرع"
        ) ||
        text.includes(
          "اتبرع"
        )
      ) {
        return res.json({
          reply:
            "📅 تقدر تحجز موعد للتبرع من صفحة مركز الدم.\n\n" +
            "اختار المركز، التاريخ، الوقت، ونوع التبرع مثل الدم الكامل أو الصفائح أو البلازما.",
        });
      }

      // ======================================================
      // Medicines - explicit medicine request
      // ======================================================

      const askingForMedicine =
        text.includes(
          "دواء"
        ) ||
        text.includes(
          "أدوية"
        ) ||
        text.includes(
          "ادوية"
        ) ||
        text.includes(
          "دوا"
        ) ||
        text.includes(
          "علاج"
        ) ||
        text.includes(
          "دواء اسمه"
        );

      if (
        askingForMedicine
      ) {
        const medicineWords =
          cleanMedicineQuery(
            text
          );

        if (medicineWords) {
          const results =
            searchMedicines(
              medicineWords
            );

          if (!results.length) {
            return res.json({
              reply:
                `مش لاقي دواء باسم "${medicineWords}" في البيانات الحالية.\n\n` +
                "ممكن تجرب كتابة اسم الدواء بشكل مختلف أو تكتب اسم المادة الفعالة لو تعرفها.",
            });
          }

          const medicineText =
            results
              .map(
                (
                  medicine,
                  index
                ) => {
                  const name =
                    medicine.name ||
                    medicine.genericName ||
                    "دواء";

                  const category =
                    medicine.category
                      ? `\n💊 الفئة: ${medicine.category}`
                      : "";

                  const quantity =
                    medicine.quantity
                      ? `\n📦 الكمية: ${medicine.quantity}`
                      : "";

                  const expiry =
                    medicine.expiry
                      ? `\n📅 الصلاحية: ${medicine.expiry}`
                      : "";

                  const donor =
                    medicine.donor
                      ? `\n🏪 المصدر: ${medicine.donor}`
                      : "";

                  return (
                    `${index + 1}. ${name}` +
                    category +
                    quantity +
                    expiry +
                    donor
                  );
                }
              )
              .join("\n\n");

          return res.json({
            reply:
              `💊 لقيت لك ${results.length} نتيجة:\n\n${medicineText}`,
          });
        }

        return res.json({
          reply:
            "💊 اكتبلي اسم الدواء اللي بتدور عليه، وأنا هبحث عنه في بيانات الأدوية الموجودة عندنا.",
        });
      }

      // ======================================================
      // Direct medicine name search
      // ======================================================

      const directMedicineResults =
        getMedicineResultsFromText(
          text
        );

      if (
        directMedicineResults.length
      ) {
        const medicineText =
          directMedicineResults
            .map(
              (
                medicine,
                index
              ) => {
                const name =
                  medicine.name ||
                  medicine.genericName ||
                  "دواء";

                const category =
                  medicine.category
                    ? `\n💊 الفئة: ${medicine.category}`
                    : "";

                const quantity =
                  medicine.quantity
                    ? `\n📦 الكمية: ${medicine.quantity}`
                    : "";

                const expiry =
                  medicine.expiry
                    ? `\n📅 الصلاحية: ${medicine.expiry}`
                    : "";

                const donor =
                  medicine.donor
                    ? `\n🏪 المصدر: ${medicine.donor}`
                    : "";

                return (
                  `${index + 1}. ${name}` +
                  category +
                  quantity +
                  expiry +
                  donor
                );
              }
            )
            .join("\n\n");

        return res.json({
          reply:
            `💊 لقيت لك ${directMedicineResults.length} نتيجة:\n\n${medicineText}`,
        });
      }

      // ======================================================
      // Hospitals
      // ======================================================

      if (
        text.includes(
          "مستشفى"
        ) ||
        text.includes(
          "المستشفيات"
        ) ||
        text.includes(
          "مستشفيات"
        )
      ) {
        const hospitalList =
          Array.isArray(
            hospitals
          )
            ? hospitals.slice(
                0,
                5
              )
            : [];

        if (!hospitalList.length) {
          return res.json({
            reply:
              "مش لاقي مستشفيات مسجلة حاليًا في البيانات.",
          });
        }

        const hospitalText =
          hospitalList
            .map(
              (
                hospital,
                index
              ) =>
                `${index + 1}. ${
                  hospital.name ||
                  hospital.title ||
                  hospital.hospitalName ||
                  "مستشفى"
                }`
            )
            .join("\n");

        return res.json({
          reply:
            `🏨 دي بعض المستشفيات المسجلة عندنا:\n\n${hospitalText}`,
        });
      }

      // ======================================================
      // User information
      // ======================================================

      if (
        text.includes(
          "بياناتي"
        ) ||
        text.includes(
          "اسمي"
        ) ||
        text.includes(
          "انا مين"
        ) ||
        text.includes(
          "مين انا"
        )
      ) {
        if (!user) {
          return res.json({
            reply:
              "لازم تكون مسجل دخول علشان أقدر أتعامل مع بيانات حسابك.",
          });
        }

        return res.json({
          reply:
            `أهلاً ${user.name || user.fullName || "بيك"} 🌷\n` +
            "أنا متصل بحسابك الحالي، وأقدر أستخدم بيانات حسابك في الخدمات المدعومة.",
        });
      }

      // ======================================================
      // General questions about Nabd Al-Amal
      // ======================================================

      if (
        text.includes(
          "نبض الامل"
        ) ||
        text.includes(
          "نبض الأمل"
        ) ||
        text.includes(
          "الابلكيشن"
        ) ||
        text.includes(
          "التطبيق"
        ) ||
        text.includes(
          "الموقع"
        )
      ) {
        return res.json({
          reply:
            "🌷 نبض الأمل منصة لمساعدة المرضى والمتبرعين من خلال:\n\n" +
            "🩸 طلب الدم والبحث عن متبرعين\n" +
            "🏥 الوصول إلى مراكز وبنوك الدم\n" +
            "💊 البحث عن الأدوية المتاحة\n" +
            "📅 حجز مواعيد التبرع\n\n" +
            "قولي محتاج تعمل إيه وأنا أساعدك.",
        });
      }

      // ======================================================
      // Default
      // ======================================================

      return res.json({
        reply:
          "فاهمك 👍\n\n" +
          "أقدر أساعدك في:\n" +
          "🩸 طلب الدم\n" +
          "🔎 البحث عن متبرع\n" +
          "🏥 مراكز وبنوك الدم\n" +
          "💊 الأدوية\n" +
          "📅 حجز موعد للتبرع\n\n" +
          "مثلاً اكتب:\n" +
          "• تاموكسيفين\n" +
          "• عايز دواء للسكر\n" +
          "• مراكز الدم في الشرقية\n" +
          "• عايز أبحث عن متبرع O+\n" +
          "• عايز أعمل طلب دم",
      });
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      return res.status(500).json({
        error:
          "حدث خطأ أثناء معالجة الرسالة",
      });
    }
  }
);

export default router;
