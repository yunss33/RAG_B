'use client';

interface ThoughtProcessProps {
  thoughtChain: string[];
  inputData?: any;
  intermediateOutputs?: any[];
  finalOutput?: any;
  start_time?: string;
  end_time?: string;
}

export function ThoughtProcess({
  thoughtChain,
  inputData,
  intermediateOutputs,
  finalOutput,
  start_time,
  end_time,
}: ThoughtProcessProps) {
  return (
    <div className="panel">
      <h2>思考过程</h2>
      <div className="stack" style={{ gap: '16px' }}>
        {(start_time || end_time) && (
          <div className="card" style={{ margin: 0 }}>
            <div className="text-sm text-gray-600">
              {start_time && <div>开始时间: {start_time}</div>}
              {end_time && <div>结束时间: {end_time}</div>}
            </div>
          </div>
        )}

        {inputData && (
          <div className="card" style={{ margin: 0 }}>
            <h3 className="font-semibold mb-2">📥 输入数据</h3>
            <pre className="text-sm bg-gray-50 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(inputData, null, 2)}
            </pre>
          </div>
        )}

        {thoughtChain.length > 0 && (
          <div className="card" style={{ margin: 0 }}>
            <h3 className="font-semibold mb-3">🧠 思考链</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="stack" style={{ gap: '12px' }}>
                {thoughtChain.map((thought, index) => (
                  <div key={index} className="relative pl-10">
                    <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm" />
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      {thought}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {intermediateOutputs && intermediateOutputs.length > 0 && (
          <div className="card" style={{ margin: 0 }}>
            <h3 className="font-semibold mb-3">📝 中间结果</h3>
            <div className="stack" style={{ gap: '12px' }}>
              {intermediateOutputs.map((output, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-blue-700 mb-2">步骤 {index + 1}</div>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(output, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {finalOutput && (
          <div className="card" style={{ margin: 0 }}>
            <h3 className="font-semibold mb-2">📤 最终输出</h3>
            <pre className="text-sm bg-green-50 p-3 rounded-lg overflow-x-auto border border-green-200">
              {JSON.stringify(finalOutput, null, 2)}
            </pre>
          </div>
        )}

        {thoughtChain.length === 0 && !inputData && !intermediateOutputs && !finalOutput && (
          <div className="text-center text-gray-500 py-8">
            暂无思考过程记录
          </div>
        )}
      </div>
    </div>
  );
}
