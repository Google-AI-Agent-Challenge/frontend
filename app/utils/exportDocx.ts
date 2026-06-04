import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ShadingType, BorderStyle } from "docx";

export interface ReportCard {
  label: string;
  score: number;
  change: number;
  insight_text: string;
  related_keywords: { keyword: string; count: number }[];
}

export interface ReviewDocData {
  rating: number;
  review_date: string;
  review_text: string;
}

export async function generateVocReport(
  cards: ReportCard[],
  aiBriefing: string,
  reviews: ReviewDocData[] = []
) {
  const children: any[] = [
    // 메인 타이틀
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      border: {
        bottom: { color: "CCCCCC", space: 1, value: BorderStyle.SINGLE, size: 6 },
      },
      children: [
        new TextRun({
          text: "화장품 VOC AI 분석 리포트",
          font: "Malgun Gothic",
          size: 32, // 16pt (half-points)
          bold: true,
        }),
      ],
    }),
    
    // 서브 타이틀: AI 종합 브리핑
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      shading: { type: ShadingType.CLEAR, fill: "F8F9FA" },
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ 
          text: "✨ AI 종합 브리핑", 
          font: "Malgun Gothic",
          bold: true,
          color: "3B8026",
          size: 28, // 14pt
        })
      ],
    }),
    
    // AI 종합 브리핑 본문
    new Paragraph({
      spacing: { after: 400, line: 360 }, // line spacing 1.5 (240 is 1x, 360 is 1.5x)
      children: [
        new TextRun({ 
          text: aiBriefing || "AI 브리핑 내용이 없습니다.",
          font: "Malgun Gothic",
          size: 22, // 11pt
        })
      ],
    }),
    
    // 서브 타이틀: 주요 분석 리스트
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      shading: { type: ShadingType.CLEAR, fill: "F8F9FA" },
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ 
          text: "📊 주요 분석 리스트", 
          font: "Malgun Gothic",
          bold: true,
          color: "3B8026",
          size: 28, // 14pt
        })
      ],
    }),
  ];

  // 주요 분석 리스트 렌더링
  cards.forEach((card) => {
    const isPositive = card.change >= 0;
    const changeSign = isPositive ? "+" : "";
    const scoreText = ` 만족도: ${card.score.toFixed(1)}% (전기 대비 ${changeSign}${card.change.toFixed(1)}%p)`;

    // 타이틀 라인
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({ text: `[${card.label}]`, font: "Malgun Gothic", bold: true, size: 24 }),
          new TextRun({ text: scoreText, font: "Malgun Gothic", color: "555555", size: 22 }),
        ],
      })
    );

    // 인사이트 내용
    if (card.insight_text) {
      children.push(
        new Paragraph({
          spacing: { after: 100, line: 312 }, // line spacing ~1.3x
          children: [
            new TextRun({ text: card.insight_text, font: "Malgun Gothic", size: 22 })
          ],
        })
      );
    }

    // 연관 키워드
    if (card.related_keywords && card.related_keywords.length > 0) {
      const kwText = card.related_keywords.map((k) => `#${k.keyword}(${k.count})`).join(" ");
      children.push(
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({ text: `연관 해시태그: `, font: "Malgun Gothic", size: 20, color: "666666" }),
            new TextRun({ text: kwText, font: "Malgun Gothic", size: 20, color: "666666" })
          ],
        })
      );
    }
  });

  // 서브 타이틀: 우선 검토 리뷰 원문
  if (reviews && reviews.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        shading: { type: ShadingType.CLEAR, fill: "F8F9FA" },
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({ 
            text: "💬 우선 검토 리뷰 원문", 
            font: "Malgun Gothic",
            bold: true,
            color: "3B8026",
            size: 28, // 14pt
          })
        ],
      })
    );

    reviews.forEach((review, index) => {
      const isLast = index === reviews.length - 1;
      
      // 별점 및 날짜 헤더
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({ 
              text: `[별점 ${review.rating}점] | ${review.review_date}`, 
              font: "Malgun Gothic",
              bold: true,
              size: 22
            }),
          ]
        })
      );

      // 리뷰 내용
      children.push(
        new Paragraph({
          spacing: { after: isLast ? 200 : 300, line: 360 }, // 1.5x 줄간격
          border: isLast ? undefined : {
            bottom: { color: "EEEEEE", space: 15, value: BorderStyle.SINGLE, size: 4 },
          },
          children: [
            new TextRun({ 
              text: review.review_text,
              font: "Malgun Gothic",
              size: 22
            })
          ]
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
