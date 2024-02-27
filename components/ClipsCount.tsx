import Button from "@/global/components/button";

type ClipsCountProps = {
  value: number;
  max: number;
  onChange?: (count: number) => void;
};
export const ClipsCount = ({ max, value, onChange }: ClipsCountProps) => {
  return (
    <>
      {Array(max)
        .fill(0)
        .map((_: null, index) => {
          return (
            <Button
              key={index.toString()}
              type={index + 1 === value ? "primary" : "default"}
              onClick={() => onChange?.(index + 1)}
              style={{ marginRight: 10, marginTop: 10 }}
            >
              {index + 1}
            </Button>
          );
        })}
    </>
  );
};
