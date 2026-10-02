import { useState } from "react";
import "./App.css";
import Item from "./components/item.tsx";
import itemsData from "./data/items.json";
const categories: Category[] = itemsData;

const AnswerLevel = {
  Never: 0,
  Ask_Me: 1,
  Willing: 2,
  Love: 3,
  Crave: 4,
} as const;

type AnswerLevel = (typeof AnswerLevel)[keyof typeof AnswerLevel];

export interface Category {
  category: string;
  items: ItemData[];
}

export interface ItemData {
  name: string;
  description?: string;
  image?: string;
  answerLevel?: AnswerLevel;
}

function App() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerLevel[][]>([]);

  function handleAnswerClick(answerLevel: AnswerLevel) {
    // append the answer to the nested answers array. Use the categoryIndex and activeItemIndex for indicies. If the categoryIndex or activeItemIndex is out of bounds, create a new array for that index.
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      if (!newAnswers[categoryIndex]) {
        newAnswers[categoryIndex] = [];
      }
      newAnswers[categoryIndex][activeItemIndex] = answerLevel;
      return newAnswers;
    });
    MoveToNextItem();
  }

  function MoveToNextItem() {
    console.log(
      "Moving to next item" +
        ` (categoryIndex: ${categoryIndex}, activeItemIndex: ${activeItemIndex})`,
    );
    if (activeItemIndex < categories[categoryIndex].items.length - 1) {
      if (categories.length <= categoryIndex + 1) {
        setCategoryIndex(0);
      } else {
        setCategoryIndex(categoryIndex + 1);
      }
      setActiveItemIndex(0);
    } else {
      setActiveItemIndex(activeItemIndex + 1);
    }
  }

  function GetItemCard() {
    const item = categories[categoryIndex].items[activeItemIndex];
    return (
      <Item
        title={item.name}
        description={item.description}
        image={item.image}
      />
    );
  }

  // The cards should be stacked, so only one is visible at a time. The visible card should be the one at the activeItemIndex.
  return (
    <>
      {GetItemCard()}
      <button onClick={() => handleAnswerClick(AnswerLevel.Never)}>
        Never
      </button>
      <button onClick={() => handleAnswerClick(AnswerLevel.Ask_Me)}>
        Ask Me
      </button>
      <button onClick={() => handleAnswerClick(AnswerLevel.Willing)}>
        Willing
      </button>
      <button onClick={() => handleAnswerClick(AnswerLevel.Love)}>Love</button>
      <button onClick={() => handleAnswerClick(AnswerLevel.Crave)}>
        Crave
      </button>
    </>
  );
  // create an item card for each item in every category
  // buttons for each answer level, when clicked, call handleAnswerClick with the corresponding answer level
  // buttons should be arranged in a row
}

export default App;
