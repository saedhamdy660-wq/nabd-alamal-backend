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
        text.includes(
          "مساعدة"
        ) ||
        text.includes(
          "تقدر تعمل ايه"
        ) ||
        text.includes(
          "تقدر تساعدني"
        ) ||
        text.includes(
          "ممكن تساعدني"
        )
      ) {
        return res.json({
          reply:
            "أقدر أساعدك في:\n\n" +
            "🩸 طلب الدم\n" +
            "🔎 البحث عن متبرعين\n" +
            "🏥 مراكز وبنوك الدم\n" +
            "📅 مواعيد التبرع\n" +
            "💊 البحث عن الأدوية\n\n" +
            "اكتبلي محتاج إيه وأنا هحاول أساعدك.",
        });
      }

      // ======================================================
      // Blood centers
      // ======================================================

      if (
        text.includes("مركز دم") ||
        text.includes("مراكز الدم") ||
        text.includes("بنك دم") ||
        text.includes("بنوك الدم") ||
        text.includes("مركز") &&
          text.includes("دم")
      ) {
        const centers =
          findCenters();

        if (!centers.length) {
          return res.json({
            reply:
              "مش لاقي مراكز دم متاحة حاليًا في البيانات.",
          });
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

        return res.json({
          reply:
            `عندنا حاليًا ${bloodCenters.length} مركز/بنك دم مسجل.\n\n` +
            `دي بعض المراكز المتاحة:\n\n${centerText}\n\n` +
            "ولو عايز مركز معين أو محافظة معينة، اكتب اسم المحافظة.",
        });
      }

      // ======================================================
      // Governorate / city center search
      // ======================================================

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

      const matchedGovernorate =
        governorates.find(
          (governorate) =>
            text.includes(
              normalizeText(
                governorate
              )
            )
        );

      if (
        matchedGovernorate &&
        (
          text.includes("مركز") ||
          text.includes("بنك") ||
          text.includes("دم")
        )
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

        return res.json({
          reply:
            `المراكز المسجلة في ${matchedGovernorate}:\n\n${centerText}`,
        });
      }

      // ======================================================
      // Donors
      // ======================================================

      if (
        text.includes("متبرع") ||
        text.includes("متبرعين")
      ) {
        const available =
          getAvailableDonorsCount();

        return res.json({
          reply:
            `حاليًا عندنا ${available} متبرع متاح في بيانات النظام.\n\n` +
            "ولو عايز أبحث لك عن متبرع مناسب، محتاج أعرف فصيلة الدم، وممكن كمان الموقع لو متاح.",
        });
      }

      // ======================================================
      // Blood requests
      // ======================================================

      if (
        text.includes(
          "طلب دم"
        ) ||
        text.includes(
          "محتاج دم"
        ) ||
        text.includes(
          "عايز دم"
        )
      ) {
        const activeRequests =
          getActiveBloodRequests();

        return res.json({
          reply:
            `تقدر تعمل طلب دم من قسم التبرع بالدم.\n\n` +
            `حاليًا يوجد ${activeRequests.length} طلب دم عام نشط في النظام.\n\n` +
            "لو عايز تعمل طلب جديد، ادخل على قسم طلب الدم وحدد فصيلة الدم والمستشفى ودرجة الاستعجال.",
        });
      }

      // ======================================================
      // Donation appointment
      // ======================================================

      if (
        text.includes("موعد") ||
        text.includes("احجز") ||
        text.includes("حجز") ||
        text.includes("تبرع")
      ) {
        return res.json({
          reply:
            "📅 تقدر تحجز موعد للتبرع من صفحة مركز الدم.\n\n" +
            "اختار المركز، التاريخ، الوقت، ونوع التبرع مثل الدم الكامل أو الصفائح أو البلازما.",
        });
      }

      // ======================================================
      // Medicines
      // ======================================================

      if (
        text.includes("دواء") ||
        text.includes("أدوية") ||
        text.includes("دواء اسمه")
      ) {
        const medicineWords =
          text
            .replace(
              "عايز أبحث عن دواء",
              ""
            )
            .replace(
              "عايز ابحث عن دواء",
              ""
            )
            .replace(
              "عايز دواء",
              ""
            )
            .replace(
              "دواء اسمه",
              ""
            )
            .replace(
              "دواء",
              ""
            )
            .trim();

        if (medicineWords) {
          const results =
            searchMedicines(
              medicineWords
            );

          if (!results.length) {
            return res.json({
              reply:
                `مش لاقي دواء باسم "${medicineWords}" في البيانات الحالية.\n\n` +
                "ممكن تجرب كتابة اسم الدواء بشكل مختلف.",
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
                      ? `\nالفئة: ${medicine.category}`
                      : "";

                  return `${index + 1}. ${name}${category}`;
                }
              )
              .join("\n\n");

          return res.json({
            reply:
              `لقيت لك ${results.length} نتيجة:\n\n${medicineText}`,
          });
        }

        return res.json({
          reply:
            "💊 اكتبلي اسم الدواء اللي بتدور عليه، وأنا هبحث عنه في بيانات الأدوية الموجودة عندنا.",
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
            `دي بعض المستشفيات المسجلة عندنا:\n\n${hospitalText}`,
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
          "جرب تكتب طلبك بشكل أوضح وأنا هساعدك.",
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
