import os

class GlossaryBuilder:
    def __init__(self):
        pass

    def extract_terms(self, text: str):
        print("Extracting terms...")
        # TODO: Implement term extraction logic
        return ["Physical AI", "Robotics"]

if __name__ == "__main__":
    builder = GlossaryBuilder()
    builder.extract_terms("Physical AI is the future of robotics.")
